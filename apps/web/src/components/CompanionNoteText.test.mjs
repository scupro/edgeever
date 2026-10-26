import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CompanionNoteText } from "./CompanionNoteText.tsx";

const render = (text, sources = []) => renderToStaticMarkup(createElement(CompanionNoteText, {
  text, sources, onOpenNote() {},
}));

describe("companion note citations", () => {
  test("renders markdown instead of raw source, and note refs as links", () => {
    const markup = render("### 任務\n\n1. **[隨手記下](#memo=memo_1)** — 收集箱\n\n[note:memo_2]", [
      { id: "memo_1", title: "隨手記下", revision: 1, notebookId: "nb_1" },
      { id: "memo_2", title: "週會", revision: 1, notebookId: "nb_1" },
    ]);
    expect(markup).toContain("companion-markdown");
    expect(markup).toContain("<h3");
    expect(markup).toContain("<ol>");
    expect(markup).toContain("<strong>");
    expect(markup).toContain("隨手記下");
    expect(markup).toContain("週會");
    expect(markup).toContain('href="#memo=memo_1"');
    expect(markup).toContain('href="#memo=memo_2"');
    expect(markup).not.toContain("### ");
    expect(markup).not.toContain("**[");
    expect(markup).not.toContain("[note:memo_2]");
  });
});
