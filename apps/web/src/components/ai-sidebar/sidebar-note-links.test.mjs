import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Streamdown } from "streamdown";
import { AiSidebarMessage } from "./AiSidebarMessage.tsx";
import { normalizeSidebarMathDelimiters, rewriteSidebarNoteLinks, sidebarNoteLinkAllowedTags, sidebarNoteLinkComponents } from "./sidebar-note-links.tsx";

const render = (markdown) => renderToStaticMarkup(createElement(Streamdown, {
  allowedTags: sidebarNoteLinkAllowedTags,
  components: sidebarNoteLinkComponents,
  mode: "static",
  children: rewriteSidebarNoteLinks(markdown),
}));

describe("sidebar note links", () => {
  test("renders explicit inline math without changing prices or code", () => {
    const markdown = "煉氣 $\\rightarrow$ 築基，價格從 $5 到 $10。公式 \\(x^2\\) 和 \\(\\frac{1}{2}\\)。\n\n`\\(x^2\\)`\n\n```md\n\\(x^2\\)\n```\n\n~~~md\n\\(x^2\\)\n~~~";
    const normalized = normalizeSidebarMathDelimiters(markdown);
    expect(normalized).toContain("煉氣 → 築基，價格從 $5 到 $10。公式 $$x^2$$ 和 $$\\frac{1}{2}$$。");
    expect(normalized).toContain("`\\(x^2\\)`");
    expect(normalized).toContain("```md\n\\(x^2\\)\n```");
    expect(normalized).toContain("~~~md\n\\(x^2\\)\n~~~");
    const markup = renderToStaticMarkup(createElement(AiSidebarMessage, { children: markdown }));
    expect(markup).toContain('class="katex"');
    expect(markup).toContain("$5 到 $10");
    expect(markup).toContain("→");
    const price = renderToStaticMarkup(createElement(AiSidebarMessage, { children: "價格從 $5 到 $10" }));
    expect(price).not.toContain('class="katex"');
    const display = renderToStaticMarkup(createElement(AiSidebarMessage, { children: "$$\nx^2 + y^2 = z^2\n$$" }));
    expect(display).toContain("katex-display");
    const code = renderToStaticMarkup(createElement(AiSidebarMessage, { children: "`\\(x^2\\)`" }));
    expect(code).not.toContain('class="katex"');
  });

  test("turns a note link into an in-app anchor and leaves other links alone", () => {
    const markdown = "已儲存至“等待分類”：\n\n[模型蒸餾流程圖](#memo=memo_03de025fc0134b7da0d155c2c1686b92)\n\n詳見 [文件](https://example.com/docs)。";
    expect(rewriteSidebarNoteLinks(markdown)).toContain(
      '<edgeever-note data-memo-id="memo_03de025fc0134b7da0d155c2c1686b92">模型蒸餾流程圖</edgeever-note>',
    );
    expect(rewriteSidebarNoteLinks(markdown)).toContain("[文件](https://example.com/docs)");

    const markup = render(markdown);
    expect(markup).toContain('href="#memo=memo_03de025fc0134b7da0d155c2c1686b92"');
    expect(markup).toContain("模型蒸餾流程圖");
    expect(markup).not.toContain('href="#memo=memo_03de025fc0134b7da0d155c2c1686b92" target="_blank"');
    expect(markup).toContain(">文件</button>");
  });

  test("keeps note-link examples inside code, and escapes the label", () => {
    const markdown = "```\n[示例](#memo=memo_secret)\n```\n\n`[行內](#memo=memo_inline)`\n\n[a<b \"c\"](#memo=memo_quoted)";
    const rewritten = rewriteSidebarNoteLinks(markdown);
    expect(rewritten).toContain("[示例](#memo=memo_secret)");
    expect(rewritten).toContain("[行內](#memo=memo_inline)");
    expect(rewritten).toContain('data-memo-id="memo_quoted"');
    expect(rewritten).toContain("a&lt;b &quot;c&quot;");
    expect(rewritten).not.toContain("<b");
  });

  test("turns a local agent's inline-code note ID into a workspace link", () => {
    const id = "memo_b99f11cbeae74e558df1a1ce96ab8381";
    const markdown = `已新建思維導圖筆記（ID：\`${id}\`）。\n\n\`普通程式碼\`\n\n\`\`\`\n${id}\n\`\`\``;
    const rewritten = rewriteSidebarNoteLinks(markdown);
    expect(rewritten).toContain(`<edgeever-note data-memo-id="${id}">${id}</edgeever-note>`);
    expect(rewritten).toContain("`普通程式碼`");
    expect(rewritten).toContain(`\`\`\`\n${id}\n\`\`\``);
    expect(render(markdown)).toContain(`href="#memo=${id}"`);
  });

  test("opens an agent's EdgeEver URL inside the current workspace", () => {
    const id = "memo_328cb20d4b4040edb3ecb24638abc2d5";
    const markdown = `已建立 [大模型蒸餾流程圖](https://edgeever.ai/memo/${id})。`;
    const rewritten = rewriteSidebarNoteLinks(markdown);
    expect(rewritten).toContain(`<edgeever-note data-memo-id="${id}">大模型蒸餾流程圖</edgeever-note>`);
    const markup = render(markdown);
    expect(markup).toContain(`href="#memo=${id}"`);
    expect(markup).not.toContain("Open external link");
    expect(markup).not.toContain("https://edgeever.ai/memo/");
  });
});
