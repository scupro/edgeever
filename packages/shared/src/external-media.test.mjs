import { describe, expect, test } from "bun:test";
import {
  docToMarkdown,
  FILE_ATTACHMENT_NODE_TYPE,
  markdownToDoc,
  resolveMemoContentDoc,
} from "./content";

const firstNode = (markdown) => {
  const top = markdownToDoc(markdown).content[0];
  if (!top) return undefined;
  return top.type === "paragraph" || top.type === "heading" ? top.content?.[0] : top;
};

describe("external media links", () => {
  test("turns a remote audio link into a playable attachment", () => {
    expect(firstNode("[音訊](https://cdn.example.com/song.mp3)")).toMatchObject({
      type: FILE_ATTACHMENT_NODE_TYPE,
      attrs: {
        url: "https://cdn.example.com/song.mp3",
        label: "音訊",
        filename: "song.mp3",
        mimeType: "audio/mpeg",
        displayMode: "inline",
      },
    });
  });

  test("turns a remote video link into a playable attachment", () => {
    expect(firstNode("[影片](https://cdn.example.com/clip.mp4)")).toMatchObject({
      type: FILE_ATTACHMENT_NODE_TYPE,
      attrs: {
        url: "https://cdn.example.com/clip.mp4",
        filename: "clip.mp4",
        mimeType: "video/mp4",
      },
    });
  });

  test("keeps the media mime type even when the label has no extension", () => {
    const node = firstNode("[聽這個](https://cdn.example.com/watch?v=1)");
    expect(node?.type).toBe("text");
    expect(firstNode("[聽這個](https://cdn.example.com/a.m4a)")).toMatchObject({
      type: FILE_ATTACHMENT_NODE_TYPE,
      attrs: { filename: "a.m4a", mimeType: "audio/mp4" },
    });
  });

  test("converts an image node whose src is a video into a player", () => {
    const node = firstNode("![影片](https://cdn.example.com/clip.mp4)");
    expect(node?.type).toBe(FILE_ATTACHMENT_NODE_TYPE);
    expect(node?.attrs).toMatchObject({ mimeType: "video/mp4", filename: "clip.mp4" });
  });

  test("leaves real images as image nodes", () => {
    expect(firstNode("![圖](https://cdn.example.com/pic.png)")).toMatchObject({
      type: "image",
      attrs: { src: "https://cdn.example.com/pic.png" },
    });
  });

  test("renders an image URL pasted as a link as an image", () => {
    const url = "https://cdn.example.com/pic.png";
    expect(firstNode(`[${url}](${url})`)).toMatchObject({ type: "image", attrs: { src: url } });
    expect(firstNode(`[](${url})`)).toMatchObject({ type: "image", attrs: { src: url } });
  });

  test("keeps a labelled image link as a link", () => {
    expect(firstNode("[下載這張圖](https://cdn.example.com/pic.png)")).toMatchObject({ type: "text" });
  });

  test("keeps ordinary web links untouched", () => {
    expect(firstNode("[官網](https://example.com/page)")).toMatchObject({ type: "text" });
  });

  test("recovers a raw audio tag outside details", () => {
    const node = firstNode('<audio controls src="https://cdn.example.com/song.mp3"></audio>');
    expect(node).toMatchObject({ type: FILE_ATTACHMENT_NODE_TYPE, attrs: { mimeType: "audio/mpeg" } });
  });

  test("does not touch media tags inside fenced code", () => {
    const doc = markdownToDoc('```html\n<audio src="https://cdn.example.com/song.mp3"></audio>\n```');
    expect(docToMarkdown(doc)).toContain("<audio src=");
  });

  test("round-trips the external media link through Markdown", () => {
    const markdown = "[音訊](https://cdn.example.com/song.mp3)";
    expect(docToMarkdown(markdownToDoc(markdown))).toBe(markdown);
  });

  test("upgrades a saved plain link into a player", () => {
    const saved = {
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{
          type: "text",
          text: "影片",
          marks: [{ type: "link", attrs: { href: "https://cdn.example.com/clip.mp4" } }],
        }],
      }],
    };
    expect(resolveMemoContentDoc(saved, "").content[0]?.content?.[0]).toMatchObject({
      type: FILE_ATTACHMENT_NODE_TYPE,
      attrs: { mimeType: "video/mp4" },
    });
  });
});