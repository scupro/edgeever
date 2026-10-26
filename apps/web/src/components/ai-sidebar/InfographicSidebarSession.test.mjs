import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { zhTW } from "../../../../../packages/shared/src/i18n/zh-TW.ts";
import { InfographicSidebarSession } from "./InfographicSidebarSession.tsx";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, enabled: false } },
});

const session = {
  turns: [{
    id: "turn-1",
    prompt: "做成資訊圖",
    createdAt: "2026-10-02T00:00:00.000Z",
    kind: "generated",
    resultTitle: "里程碑",
    response: "相關筆記：[演進里程碑](#memo=memo_demo_infographic)\n\n詳見 [文件](https://example.com/docs)。",
  }],
  activeTurn: {
    prompt: "再補一張",
    response: "見 [流程圖](#memo=memo_03de025fc0134b7da0d155c2c1686b92)",
  },
  generating: false,
  readOnly: true,
  canUndo: false,
  hasGraphic: true,
  async onSubmit() {},
  onUndo() {},
  onStop() {},
};

describe("infographic sidebar note links", () => {
  test("renders note links as in-app anchors and leaves external links as buttons", async () => {
    const i18n = createInstance();
    await i18n.init({ lng: "zh-TW", resources: { "zh-TW": { translation: zhTW } } });
    const markup = renderToStaticMarkup(createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        I18nextProvider,
        { i18n },
        createElement(InfographicSidebarSession, {
          session,
          noteTitle: "演進里程碑",
          onOpenChange() {},
          onOpenNote() {},
        }),
      ),
    ));
    expect(markup).toContain('href="#memo=memo_demo_infographic"');
    expect(markup).toContain('href="#memo=memo_03de025fc0134b7da0d155c2c1686b92"');
    expect(markup).toContain("演進里程碑");
    expect(markup).toContain("流程圖");
    expect(markup).not.toContain('href="#memo=memo_demo_infographic" target="_blank"');
    expect(markup).toContain(">文件</button>");
    expect(markup).not.toContain('href="https://example.com/docs"');
  });
});
