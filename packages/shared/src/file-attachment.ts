import { mergeAttributes, Node } from "@tiptap/core";
import type { TiptapDoc, TiptapMark, TiptapNode, TiptapTextNode } from "./content";
import { resolveAttachmentKind, resolvePlayableMediaMimeType } from "./attachment-kind";
import { getAttachmentFilenameFromLabel } from "./resource-links";
import { normalizeAttachmentByteSize } from "./attachment-metadata";

export const FILE_ATTACHMENT_NODE_TYPE = "edgeeverFileAttachment" as const;
export const FILE_DISPLAY_MODES = ["compact", "inline"] as const;
export type FileDisplayMode = (typeof FILE_DISPLAY_MODES)[number];

/** Video preview defaults to expanded so notes open ready to play. */
export const resolveFileDisplayMode = (value: unknown): FileDisplayMode =>
  value === "compact" ? "compact" : "inline";

const MARKDOWN_LINK_PATTERN = /^\[([^\]]+)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/;
const ATTACHMENT_LABEL_PATTERN = /^\s*(?:附件[：:]|Attachment:)\s*/i;
const RESOURCE_URL_PATTERN = /(?:\/api\/v1\/resources\/|edgeever-(?:resource|staged):\/\/)/i;

const escapeMarkdownLabel = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");

/**
 * Remote audio/video URLs must become attachment nodes even without an
 * "Attachment:" label, otherwise a pasted external `.mp3`/`.mp4` link stays a
 * plain link and the read-only view shows source text instead of a player.
 */
export const isPlayableMediaUrl = (url: string) =>
  resolvePlayableMediaMimeType(null, url) !== null;

export const isFileAttachmentLink = (label: string, url: string) => {
  if (resolveAttachmentKind(null, getAttachmentFilenameFromLabel(label)) === "pdf" || resolveAttachmentKind(null, url) === "pdf") {
    return false;
  }
  // A link title can end in a file extension without linking to a file (for example, "arXiv cs.AI").
  return isPlayableMediaUrl(url) || ATTACHMENT_LABEL_PATTERN.test(label) || RESOURCE_URL_PATTERN.test(url);
};

export const FileAttachment = Node.create({
  name: FILE_ATTACHMENT_NODE_TYPE,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-file-url") || "",
        renderHTML: (attributes) => ({ "data-file-url": attributes.url || "" }),
      },
      label: {
        default: "Attachment",
        parseHTML: (element) => element.getAttribute("data-file-label") || "Attachment",
        renderHTML: (attributes) => ({ "data-file-label": attributes.label || "Attachment" }),
      },
      filename: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-file-name") || "",
        renderHTML: (attributes) => ({ "data-file-name": attributes.filename || "" }),
      },
      mimeType: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-file-mime-type") || "",
        renderHTML: (attributes) => ({ "data-file-mime-type": attributes.mimeType || "" }),
      },
      byteSize: {
        default: null,
        parseHTML: (element) => normalizeAttachmentByteSize(element.getAttribute("data-file-byte-size")),
        renderHTML: (attributes) => {
          const byteSize = normalizeAttachmentByteSize(attributes.byteSize);
          return byteSize === null ? {} : { "data-file-byte-size": String(byteSize) };
        },
      },
      displayMode: {
        default: "inline",
        parseHTML: (element) => resolveFileDisplayMode(element.getAttribute("data-file-display-mode")),
        renderHTML: (attributes) => {
          const displayMode = resolveFileDisplayMode(attributes.displayMode);
          return displayMode === "compact" ? { "data-file-display-mode": displayMode } : {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="edgeever-file-attachment"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "edgeever-file-attachment",
        class: "edgeever-file-attachment",
      }),
    ];
  },

  parseMarkdown: (token) => {
    const label = token.label || "Attachment";
    const url = token.url || "";
    const mediaMime = resolvePlayableMediaMimeType(null, url);
    return {
      type: FILE_ATTACHMENT_NODE_TYPE,
      attrs: {
        url,
        label,
        filename: resolveAttachmentFilename(label, url, mediaMime),
        mimeType: mediaMime ?? "",
        byteSize: null,
        displayMode: "inline",
      },
    };
  },

  renderMarkdown: (node) =>
    `[${escapeMarkdownLabel(String(node.attrs?.label || "Attachment"))}](${String(node.attrs?.url || "")})`,

  markdownTokenizer: {
    name: FILE_ATTACHMENT_NODE_TYPE,
    level: "inline",
    start(source: string) {
      return source.indexOf("[");
    },
    tokenize(source: string) {
      const match = MARKDOWN_LINK_PATTERN.exec(source);
      if (!match || !isFileAttachmentLink(match[1], match[2])) return undefined;
      return {
        type: FILE_ATTACHMENT_NODE_TYPE,
        raw: match[0],
        label: match[1],
        url: match[2],
      };
    },
  },
});

const getLinkMark = (node: TiptapTextNode): TiptapMark | undefined =>
  node.marks?.find((mark) => mark.type === "link" && typeof mark.attrs?.href === "string");

const filenameFromUrl = (url: string) => {
  const clean = url.split(/[?#]/)[0] ?? "";
  return clean.split("/").filter(Boolean).pop() ?? "";
};

const looksLikeFilename = (value: string) => /\.[a-z0-9]{1,8}$/i.test(value.trim());

/**
 * A playable attachment must keep an extension-bearing filename (or an explicit
 * media mime type); otherwise `resolveAttachmentKind` classifies it as a plain
 * file and the editor renders a file chip instead of an audio/video player.
 */
const resolveAttachmentFilename = (label: string, url: string, mediaMime: string | null) => {
  const fromLabel = getAttachmentFilenameFromLabel(label);
  if (!mediaMime) return fromLabel;
  if (fromLabel && looksLikeFilename(fromLabel)) return fromLabel;
  return filenameFromUrl(url) || fromLabel;
};

const createPlayableMediaAttachment = (src: string, alt: string) => {
  const mediaMime = resolvePlayableMediaMimeType(null, src);
  const label = alt.trim() || filenameFromUrl(src) || "Attachment";
  return {
    type: FILE_ATTACHMENT_NODE_TYPE,
    attrs: {
      url: src,
      label,
      filename: resolveAttachmentFilename(label, src, mediaMime),
      mimeType: mediaMime ?? "",
      byteSize: null,
      displayMode: "inline",
    },
  };
};

/**
 * `![video](https://host/clip.mp4)` parses as an image node whose src is not an
 * image, which renders as a broken image even in read-only mode. Convert those
 * (and nested occurrences) into playable attachment nodes.
 */
export const upgradePlayableMediaImages = (doc: TiptapDoc): TiptapDoc => {
  const upgradeNode = (node: TiptapNode | TiptapTextNode, insideParagraph: boolean): TiptapNode | TiptapTextNode => {
    if ("text" in node) return node;
    const src = node.type === "image" && typeof node.attrs?.src === "string" ? node.attrs.src.trim() : "";
    if (src && isPlayableMediaUrl(src)) {
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const attachment = createPlayableMediaAttachment(src, alt);
      return insideParagraph ? attachment : { type: "paragraph", content: [attachment] };
    }
    if (!node.content) return node;
    const childInsideParagraph = node.type === "paragraph" || node.type === "heading";
    const content = node.content.map((child) => upgradeNode(child, childInsideParagraph));
    return content.some((child, index) => child !== node.content?.[index]) ? { ...node, content } : node;
  };

  const content = doc.content.map((node) => upgradeNode(node, false));
  return content.some((node, index) => node !== doc.content[index]) ? { ...doc, content } : doc;
};

const getLinkAttachmentAttrs = (link: TiptapMark | undefined, label: string, url = "") => {
  const mediaMime = resolvePlayableMediaMimeType(null, url);
  const declaredMime = typeof link?.attrs?.attachmentMimeType === "string" ? link.attrs.attachmentMimeType : "";
  return {
    filename: typeof link?.attrs?.attachmentFilename === "string"
      ? link.attrs.attachmentFilename
      : resolveAttachmentFilename(label, url, mediaMime),
    mimeType: declaredMime || mediaMime || "",
    byteSize: normalizeAttachmentByteSize(link?.attrs?.attachmentByteSize),
  };
};

/** Upgrade legacy standalone attachment links while preserving ordinary web links. */
export const upgradeStandaloneFileLinks = (doc: TiptapDoc): TiptapDoc => {
  let changed = false;
  const visitChild = (child: TiptapNode | TiptapTextNode): TiptapNode | TiptapTextNode => {
    if (child.type === "text") return child;
    if (child.type === FILE_ATTACHMENT_NODE_TYPE) {
      const label = typeof child.attrs?.label === "string" ? child.attrs.label : "";
      const url = typeof child.attrs?.url === "string" ? child.attrs.url : "";
      const mimeType = typeof child.attrs?.mimeType === "string" ? child.attrs.mimeType : "";
      const byteSize = normalizeAttachmentByteSize(child.attrs?.byteSize);
      if (label && url && !mimeType && byteSize === null && !isFileAttachmentLink(label, url)) {
        changed = true;
        return { type: "text", text: label, marks: [{ type: "link", attrs: { href: url, target: "_blank" } }] };
      }
    }
    return visit(child);
  };
  const visit = (node: TiptapNode): TiptapNode => {
    if (node.type === "paragraph" && node.content?.length === 1) {
      const child = node.content[0];
      if (child.type === "text" && "text" in child) {
        const link = getLinkMark(child);
        const href = link?.attrs?.href;
        if (typeof href === "string" && isFileAttachmentLink(child.text, href)) {
          changed = true;
          return {
            ...node,
            content: [{
              type: FILE_ATTACHMENT_NODE_TYPE,
              attrs: {
                url: href,
                label: child.text,
                ...getLinkAttachmentAttrs(link, child.text, href),
              },
            }],
          };
        }
      }
    }
    return node.content ? { ...node, content: node.content.map(visitChild) } : node;
  };
  const content = doc.content.map(visit);
  return changed ? { ...doc, content } : doc;
};
