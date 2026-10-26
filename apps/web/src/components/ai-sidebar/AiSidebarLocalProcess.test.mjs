import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { zhTW } from "../../../../../packages/shared/src/i18n/zh-TW.ts";
import { AiSidebarLocalProcess } from "./AiSidebarLocalProcess.tsx";

const renderProcess = async (props) => {
  const i18n = createInstance();
  await i18n.init({ lng: "zh-TW", resources: { "zh-TW": { translation: zhTW } } });
  return renderToStaticMarkup(createElement(
    I18nextProvider,
    { i18n },
    createElement(AiSidebarLocalProcess, props),
  ));
};

describe("local agent thinking process", () => {
  test("opens streamed reasoning while the agent is still thinking", async () => {
    const markup = await renderProcess({
      reasoning: "先按名稱和價格把 12 個節點對齊。",
      tools: [{ id: "tool-1", name: "view_file", status: "in_progress", title: "檢視當前筆記" }],
      running: true,
    });
    expect(markup).toContain("思考過程");
    expect(markup).toContain("先按名稱和價格把 12 個節點對齊。");
    expect(markup).toContain('data-state="open"');
    expect(markup).not.toContain('data-state="closed"');
  });

  test("starts collapsed once the answer is already on screen", async () => {
    const markup = await renderProcess({
      reasoning: "先按名稱和價格把 12 個節點對齊。",
      tools: [],
      running: true,
      answering: true,
    });
    expect(markup).toContain('data-state="closed"');
    expect(markup).not.toContain('data-state="open"');
  });

  test("keeps a finished turn collapsed", async () => {
    const markup = await renderProcess({
      reasoning: "已經對過價格。",
      tools: [],
      running: false,
    });
    expect(markup).toContain("思考過程");
    expect(markup).toContain('data-state="closed"');
    expect(markup).not.toContain('data-state="open"');
  });
});
