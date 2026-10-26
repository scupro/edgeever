import { describe, expect, test } from "bun:test";
import { sidebarCompanionFocus, sidebarLocalContextText } from "./ai-sidebar-context.ts";

const note = {
  memoId: "note-1",
  notebookId: "book-1",
  notebookTitle: "音樂",
  noteTitle: "QQ 音樂等級",
  contentMarkdown: "關於 QQ 音樂等級的長篇筆記",
};
const conversation = (message = "翻譯一下當前筆記。", recentUserMessages = [], fallbackLocale = "en-US") => ({
  message, recentUserMessages, fallbackLocale,
});

describe("AI sidebar note context", () => {
  test("a request receives the open note identity without its body", () => {
    expect(sidebarCompanionFocus(note, false)).toEqual({ memoId: "note-1", title: "QQ 音樂等級" });
    const localContext = sidebarLocalContextText(note, false, conversation());
    expect(localContext).toContain("ID: note-1");
    expect(localContext).toContain("Title (data): QQ 音樂等級");
    expect(localContext).toContain("get_memo");
    expect(localContext).toContain("translate into Traditional Chinese without asking");
    expect(localContext).toContain("write inline LaTeX as \\(...\\)");
    expect(localContext).toContain("Do not use $...$ for inline math");
    expect(localContext).not.toContain(note.contentMarkdown);
  });

  test("explicitly including the current note works for both assistant modes", () => {
    expect(sidebarCompanionFocus(note, true)).toEqual({
      memoId: "note-1",
      notebookId: "book-1",
      notebookTitle: "音樂",
      title: "QQ 音樂等級",
      contentMarkdown: "關於 QQ 音樂等級的長篇筆記",
    });
    expect(sidebarLocalContextText(note, true, conversation())).toContain("關於 QQ 音樂等級的長篇筆記");
  });

  test("an explicitly pinned selection is retained without the rest of the note", () => {
    const selected = { ...note, selectionMarkdown: "  需要解釋的句子  " };
    expect(sidebarCompanionFocus(selected, false)).toEqual({ memoId: "note-1", title: "QQ 音樂等級", selectionMarkdown: "需要解釋的句子" });
    expect(sidebarLocalContextText(selected, false, conversation())).toContain("需要解釋的句子");
    expect(sidebarLocalContextText(selected, false, conversation())).not.toContain(note.contentMarkdown);
  });

  test("switching notes sends only the newly open note identity", () => {
    const switched = { ...note, memoId: "note-2", noteTitle: "第二篇", contentMarkdown: "第二篇正文" };
    expect(sidebarCompanionFocus(switched, false)).toEqual({ memoId: "note-2", title: "第二篇" });
    expect(sidebarLocalContextText(switched, false, conversation())).toContain("ID: note-2");
    expect(sidebarLocalContextText(switched, false, conversation())).not.toContain("note-1");
  });

  test("local agents follow the request language ahead of interface language", () => {
    expect(sidebarLocalContextText(note, false, conversation("翻譯一下", [], "ja"))).toContain("Traditional Chinese (current request)");
    expect(sidebarLocalContextText(note, false, conversation("このノートを翻訳して", [], "zh-TW"))).toContain("Japanese (current request)");
    expect(sidebarLocalContextText(note, false, conversation("Translate this note", [], "zh-TW"))).toContain("English (current request)");
    expect(sidebarLocalContextText(note, false, conversation("🔄", ["このノートを読んで"], "zh-TW"))).toContain("Japanese (recent conversation)");
    expect(sidebarLocalContextText(note, false, conversation("請翻譯我正在看的內容，並把譯文作為回覆寫給我。", ["このノートを読んで"], "zh-TW"))).toContain("Japanese (recent conversation)");
    expect(sidebarLocalContextText(note, false, conversation("請翻譯下面這段文字：如果原文是繁體中文，譯成英文；否則譯成繁體中文。\n\nEnglish source", ["このノートを読んで"], "zh-TW"))).toContain("Japanese (recent conversation)");
    expect(sidebarLocalContextText(note, false, conversation("請翻譯下面這段文字。按當前對話的語言選擇目標語言。\n\nEnglish source", ["このノートを読んで"], "zh-TW"))).toContain("Japanese (recent conversation)");
    expect(sidebarLocalContextText(note, false, conversation("下の文章をこの会話の言語に翻訳してください。\n\nEnglish source", ["請讀這篇筆記"], "ja"))).toContain("Traditional Chinese (recent conversation)");
    expect(sidebarLocalContextText(note, false, conversation("🔄", [], "zh-TW"))).toContain("Traditional Chinese (interface)");
    expect(sidebarLocalContextText(note, false, conversation("请翻译：これは日本語です", [], "en-US"))).toContain("Traditional Chinese (current request)");
    expect(sidebarLocalContextText(note, false, conversation("Translate: 這是中文", [], "zh-TW"))).toContain("English (current request)");
  });
});
