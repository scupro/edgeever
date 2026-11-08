/**
 * External (remote http/https) media that users paste into notes.
 *
 * Three shapes never reach a node renderer on their own:
 *  1. An image URL pasted as an explicit link — `[](https://host/a.png)` or
 *     `[https://host/a.png](https://host/a.png)` — stays an inline link, so the
 *     read-only view shows a URL instead of the image.
 *  2. Raw `<audio>`/`<video>` tags outside a details block are dropped by the
 *     Markdown parser entirely, so the note loses the media source.
 *  3. Older saved documents may still hold such an image link as a plain link
 *     mark, which the node-level upgrade below repairs.
 *
 * A bare URL is deliberately left alone: CommonMark autolinks it, and rewriting
 * every pasted image URL would change the meaning of ordinary notes.
 */
import type { TiptapDoc, TiptapNode, TiptapTextNode } from "./content";
import { markdownToDoc } from "./content";
import { EMPTY_EXTERNAL_LINK_NODE_TYPE } from "./empty-external-link";

const IMAGE_EXTENSION_PATTERN = /\.(?:apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i;

export const isRemoteHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isRemoteImageUrl = (value: unknown): value is string =>
  isRemoteHttpUrl(value) && IMAGE_EXTENSION_PATTERN.test(value.trim().split(/[?#]/)[0] ?? "");

const CODE_FENCE_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~|\$\$[\s\S]*?\$\$)/g;
const DETAILS_SEGMENT = /(<details\b[\s\S]*?<\/details\s*>)/i;
const HTML_MEDIA_TAG_PATTERN = /<(audio|video)\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*(?:<\/\1\s*>)?/gi;
const MARKDOWN_LINK_PATTERN = /(?<!!)\[([^\]\n]*)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * `<details>` bodies already translate `<video src>` and `<img>` into nodes and
 * serialize back to tags, so they must be left exactly as written. Fenced code
 * and display math are literal too.
 */
const mapOutsideProtectedBlocks = (markdown: string, transform: (segment: string) => string) =>
  markdown.split(DETAILS_SEGMENT).map((outer, index) => {
    if (index % 2 === 1) return outer;
    return outer.split(CODE_FENCE_SEGMENT).map((segment) => {
      if (segment.startsWith("```") || segment.startsWith("~~~") || segment.startsWith("$$")) {
        return segment;
      }
      return transform(segment);
    }).join("");
  }).join("");

const filenameFromUrl = (url: string) => {
  const clean = url.split(/[?#]/)[0] ?? "";
  return clean.split("/").filter(Boolean).pop() ?? "";
};

/**
 * Rewrite `[url](image-url)` / `[](image-url)` into real Markdown image syntax so
 * the existing image tokenizer produces an image node. A labelled link such as
 * `[下載這張圖](a.png)` keeps its intent and stays a link.
 */
export const normalizeRemoteImageLinks = (markdown: string) =>
  mapOutsideProtectedBlocks(markdown, (segment) =>
    segment.replace(MARKDOWN_LINK_PATTERN, (match, label: string, url: string) => {
      if (!isRemoteImageUrl(url)) return match;
      const trimmedLabel = label.trim();
      if (trimmedLabel && trimmedLabel !== url) return match;
      return `![${trimmedLabel}](${url})`;
    })
  );

/**
 * Rewrite raw `<audio src>` / `<video src>` tags into Markdown links so the
 * shared parser can turn them into playable attachment nodes instead of
 * discarding them.
 */
export const normalizeHtmlMediaTags = (markdown: string) =>
  mapOutsideProtectedBlocks(markdown, (segment) =>
    segment.replace(HTML_MEDIA_TAG_PATTERN, (_match, _tag: string, src: string) => {
      const label = filenameFromUrl(src) || src;
      return `[${label.replace(/[[\]]/g, "")}](${src})`;
    })
  );

const createImageNode = (src: string, alt: string, width: unknown): TiptapNode => ({
  type: "image",
  attrs: { src, alt, title: null, width },
});

const singleChild = (node: TiptapNode): TiptapNode | TiptapTextNode | undefined =>
  node.content?.length === 1 ? node.content[0] : undefined;

/**
 * Repairs already-saved documents whose image URL is stored as a link mark
 * (the editor inserts `[text](href)` nodes, which never pass through Markdown).
 */
export const upgradeRemoteImageLinks = (doc: TiptapDoc, defaultWidth: unknown): TiptapDoc => {
  const upgradeParagraph = (node: TiptapNode): TiptapNode => {
    if (node.type !== "paragraph") return node;
    const child = singleChild(node);
    if (!child) return node;

    if (child.type === EMPTY_EXTERNAL_LINK_NODE_TYPE) {
      const href = typeof child.attrs?.href === "string" ? child.attrs.href : "";
      return isRemoteImageUrl(href) ? createImageNode(href.trim(), "", defaultWidth) : node;
    }

    if (!("text" in child)) return node;
    const link = child.marks?.find((mark) => mark.type === "link");
    const href = typeof link?.attrs?.href === "string" ? link.attrs.href.trim() : "";
    if (!href || !isRemoteImageUrl(href)) return node;
    const label = child.text.trim();
    if (label && label !== href) return node;
    return createImageNode(href, "", defaultWidth);
  };

  const visit = (node: TiptapNode): TiptapNode => {
    if (node.type === "paragraph") return upgradeParagraph(node);
    if (!node.content) return node;
    const content = node.content.map((child) => ("text" in child ? child : visit(child)));
    return content.some((child, index) => child !== node.content?.[index]) ? { ...node, content } : node;
  };

  const content = doc.content.map(visit);
  return content.some((node, index) => node !== doc.content[index]) ? { ...doc, content } : doc;
};
const MEDIA_PASTE_MARKER = /\]\(\s*https?:\/\/[^\s)]*\.(?:aac|flac|m4a|m4v|mov|mp3|mp4|oga|ogg|ogv|opus|wav|webm)(?:[?#][^\s)]*)?\s*\)|<(?:audio|video)\b[^>]*?\bsrc\s*=\s*["']https?:\/\/[^"']+["']/i;

/**
 * Notes written by older versions stored a pasted media link (or a raw
 * `<audio>` / `<video>` tag) as literal text, because nothing parsed pasted
 * plain text as Markdown. Re-parse those paragraphs so existing notes heal
 * without being edited by hand.
 */
export const upgradeMediaPasteParagraphs = (doc: TiptapDoc): TiptapDoc => {
  const toNodes = (text: string): TiptapNode[] | null => {
    if (!MEDIA_PASTE_MARKER.test(text)) return null;
    let parsed: TiptapDoc;
    try {
      parsed = markdownToDoc(text);
    } catch {
      return null;
    }
    return parsed.content.some((node) => node.type === "paragraph" && node.content?.some((child) => "text" in child))
      ? null
      : parsed.content;
  };

  const visit = (node: TiptapNode): TiptapNode[] => {
    if (node.type === "paragraph") {
      const text = (node.content ?? []).every((child) => "text" in child && !child.marks?.length)
        ? (node.content ?? []).map((child) => ("text" in child ? child.text : "")).join("")
        : null;
      if (text) {
        const nodes = toNodes(text);
        if (nodes) return nodes;
      }
    }
    if (!node.content) return [node];
    const content = node.content.flatMap((child) => ("text" in child ? [child] : visit(child)));
    return content.length === node.content.length && content.every((child, index) => child === node.content?.[index])
      ? [node]
      : [{ ...node, content }];
  };

  const content = doc.content.flatMap(visit);
  return content.length === doc.content.length && content.every((node, index) => node === doc.content[index])
    ? doc
    : { ...doc, content };
};
