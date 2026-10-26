import { describe, expect, test } from "bun:test";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextSelection } from "@tiptap/pm/state";
import { ensureTestWindowDom } from "../../lib/restore-test-global.mjs";
import {
  filterNoteLinkSuggestions,
  insertSuggestedNoteLink,
  createNoteLinkSuggestionExtension,
} from "./NoteLinkSuggestion.tsx";

const labels = {
  menu: "引用筆記",
  empty: "沒有找到可引用的筆記",
  close: "關閉引用筆記",
  untitled: "無標題筆記",
};

const memo = (overrides) => ({
  id: "memo-1",
  title: "專案筆記",
  excerpt: "專案摘要",
  isDeleted: false,
  ...overrides,
});

describe("note link suggestion", () => {
  const suggestionFor = (content) => {
    ensureTestWindowDom();
    const editor = new Editor({
      extensions: [StarterKit, createNoteLinkSuggestionExtension({
        getCurrentMemoId: () => null,
        getLabels: () => labels,
        searchMemos: async () => [],
      })],
      content: { type: "doc", content: [{ type: "paragraph", content }] },
    });
    try {
      const initialState = editor.state.reconfigure({ plugins: editor.extensionManager.plugins });
      const plugin = initialState.plugins.find((item) => item.key.startsWith("edgeever-note-link-suggestion$"));
      const state = initialState.apply(initialState.tr.setSelection(TextSelection.atEnd(initialState.doc)));
      return plugin.getState(state);
    } finally {
      editor.destroy();
    }
  };

  test("does not open for @ embedded in passwords, emails, or ordinary text", () => {
    for (const text of ["secret+@F(", "user@example.com", "文字@筆記", "hello@"]) {
      expect(suggestionFor([{ type: "text", text }]).active).toBe(false);
    }
  });

  test("opens at paragraph starts and after whitespace, including multiword queries", () => {
    for (const [text, query] of [["@", ""], ["@專案", "專案"], ["參考 @專案 筆記", "專案 筆記"], ["參考\t@專案", "專案"], ["參考\u3000@專案", "專案"]]) {
      const suggestion = suggestionFor([{ type: "text", text }]);
      expect(suggestion.active).toBe(true);
      expect(suggestion.query).toBe(query);
    }
  });

  test("formatting does not turn an embedded @ into a paragraph-start trigger", () => {
    expect(suggestionFor([
      { type: "text", text: "secret+" },
      { type: "text", text: "@F(", marks: [{ type: "bold" }] },
    ]).active).toBe(false);
    expect(suggestionFor([
      { type: "text", text: "參考 " },
      { type: "text", text: "@專案", marks: [{ type: "bold" }] },
    ]).active).toBe(true);
  });

  test("opens after a hard break but not immediately after inline code", () => {
    expect(suggestionFor([
      { type: "text", text: "參考" },
      { type: "hardBreak" },
      { type: "text", text: "@專案" },
    ]).active).toBe(true);
    expect(suggestionFor([
      { type: "text", text: "user", marks: [{ type: "code" }] },
      { type: "text", text: "@example.com" },
    ]).active).toBe(false);
  });

  test("excludes the current and deleted notes", () => {
    expect(filterNoteLinkSuggestions([
      memo({ id: "current" }),
      memo({ id: "deleted", isDeleted: true }),
      memo({ id: "available" }),
    ], "current").map((item) => item.id)).toEqual(["available"]);
  });

  test("replaces the @ query with the existing internal-note link format", () => {
    ensureTestWindowDom();
    const editor = new Editor({
      extensions: [StarterKit],
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "@專案" }] }],
      },
    });

    insertSuggestedNoteLink({
      editor,
      item: memo({ id: "target" }),
      labels,
      range: { from: 1, to: 4 },
    });

    expect(editor.getJSON().content[0].content).toEqual([{
      type: "text",
      marks: [{
        type: "link",
        attrs: {
          href: "#memo=target",
          target: "_blank",
          rel: "noopener noreferrer nofollow",
          class: "edgeever-note-link",
          title: null,
        },
      }],
      text: "專案筆記",
    }]);
    editor.destroy();
  });

  test("uses the untitled fallback for an empty title", () => {
    ensureTestWindowDom();
    const editor = new Editor({
      extensions: [StarterKit],
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "@" }] }],
      },
    });

    insertSuggestedNoteLink({
      editor,
      item: memo({ id: "untitled", title: "" }),
      labels,
      range: { from: 1, to: 2 },
    });

    expect(editor.getText()).toBe("無標題筆記");
    editor.destroy();
  });
});
