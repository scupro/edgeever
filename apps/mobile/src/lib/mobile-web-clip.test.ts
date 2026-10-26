import { describe, expect, test } from "bun:test";
import {
  buildMobileWebClipDraft,
  buildMobileWebClipDraftFromRenderedPage,
  extractPageTitle,
  getSharedImages,
  getSharedWebUrl,
  htmlToMarkdown,
  isWeChatArticleUrl,
} from "./mobile-web-clip";

describe("mobile web clip", () => {
  test("normalizes resolved images shared by another Android app", () => {
    expect(getSharedImages([
      {
        contentMimeType: "image/webp",
        contentType: "image",
        contentUri: "file:///cache/zhihu-image.webp",
        mimeType: "image/*",
        originalName: "zhihu-image.webp",
        shareType: "image",
        value: "content://com.zhihu.android/image/42",
      },
    ])).toEqual([{
      mimeType: "image/webp",
      name: "zhihu-image.webp",
      uri: "file:///cache/zhihu-image.webp",
    }]);
  });

  test("extracts a WeChat URL embedded in shared text", () => {
    expect(getSharedWebUrl([
      { shareType: "text", value: "一篇文章\nhttps://mp.weixin.qq.com/s/abc123" },
    ])).toBe("https://mp.weixin.qq.com/s/abc123");
    expect(isWeChatArticleUrl("https://mp.weixin.qq.com/s/abc123")).toBe(true);
    expect(isWeChatArticleUrl("http://mp.weixin.qq.com/s/abc123")).toBe(false);
  });

  test("extracts title regardless of meta attribute order", () => {
    expect(extractPageTitle('<meta content="公眾號文章標題 &amp; 更多" property="og:title">'))
      .toBe("公眾號文章標題 & 更多");
  });

  test("turns common article HTML into readable markdown", () => {
    const markdown = htmlToMarkdown(`
      <section>
        <h2>第一節</h2>
        <p>正文<strong>重點</strong><br>下一行</p>
        <img data-src="https://mmbiz.qpic.cn/example.jpg" alt="示例圖">
        <p><a href="https://example.com">閱讀更多</a></p>
      </section>
    `);
    expect(markdown).toContain("## 第一節");
    expect(markdown).toContain("正文**重點**\n下一行");
    expect(markdown).toContain("![示例圖](https://mmbiz.qpic.cn/example.jpg)");
    expect(markdown).toContain("[閱讀更多](https://example.com)");
  });

  test("builds a complete WeChat clip from nested js_content", async () => {
    const html = `
      <html><head><meta property="og:title" content="測試文章"></head>
      <body><div id="js_content"><section><p>開頭</p><div><p>巢狀正文</p></div></section></div></body></html>
    `;
    const draft = await buildMobileWebClipDraft("https://mp.weixin.qq.com/s/test", {
      capturedAt: new Date("2026-07-31T00:00:00.000Z"),
      fetcher: async () => new Response(html, { status: 200 }),
    });
    expect(draft.title).toBe("測試文章");
    expect(draft.tagsText).toBe("web-clip, wechat");
    expect(draft.contentMarkdown).toContain("開頭");
    expect(draft.contentMarkdown).toContain("巢狀正文");
    expect(draft.contentMarkdown).toContain("2026-07-31T00:00:00.000Z");
  });

  test("builds a WeChat clip from a rendered WebView page", () => {
    const draft = buildMobileWebClipDraftFromRenderedPage(
      "https://mp.weixin.qq.com/s/rendered",
      {
        title: "渲染後的公眾號標題 &amp; 更多",
        finalUrl: "https://mp.weixin.qq.com/s/rendered",
        contentHtml: `
          <section>
            <p>這是瀏覽器渲染後提取的正文。</p>
            <img data-src="//mmbiz.qpic.cn/example.jpg" alt="文章配圖">
            <a href="/s/related">相關文章</a>
          </section>
        `,
      },
      { capturedAt: new Date("2026-07-31T00:00:00.000Z") },
    );

    expect(draft.title).toBe("渲染後的公眾號標題 & 更多");
    expect(draft.contentMarkdown).toContain("這是瀏覽器渲染後提取的正文。");
    expect(draft.contentMarkdown).toContain(
      "![文章配圖](https://mmbiz.qpic.cn/example.jpg)",
    );
    expect(draft.contentMarkdown).toContain(
      "[相關文章](https://mp.weixin.qq.com/s/related)",
    );
  });

  test("keeps the source URL when fetching fails", async () => {
    const draft = await buildMobileWebClipDraft("https://mp.weixin.qq.com/s/offline", {
      fetcher: async () => {
        throw new Error("offline");
      },
    });
    expect(draft.contentMarkdown).toContain("https://mp.weixin.qq.com/s/offline");
    expect(draft.contentMarkdown).toContain("來源：");
    expect(draft.contentMarkdown).toContain("剪藏時間：");
    expect(draft.contentMarkdown).toContain("正文暫時無法抓取");
  });

  test("writes English source labels into a new clip", () => {
    const draft = buildMobileWebClipDraftFromRenderedPage(
      "https://example.com/story",
      {
        title: "Story",
        finalUrl: "https://example.com/story",
        contentHtml: "<p>Body</p><img src=\"https://example.com/a.png\">",
      },
      { capturedAt: new Date("2026-07-31T00:00:00.000Z"), locale: "en-US" },
    );

    expect(draft.contentMarkdown).toContain("Source: [https://example.com/story](https://example.com/story)");
    expect(draft.contentMarkdown).toContain("Captured at: 2026-07-31T00:00:00.000Z");
    expect(draft.contentMarkdown).toContain("![Image](https://example.com/a.png)");
    expect(draft.contentMarkdown).not.toContain("來源");
  });

  test("writes Japanese labels when the page cannot be fetched", async () => {
    const draft = await buildMobileWebClipDraft("notaurl", {
      capturedAt: new Date("2026-07-31T00:00:00.000Z"),
      fetcher: async () => {
        throw new Error("offline");
      },
      locale: "ja",
    });

    expect(draft.title).toBe("ウェブクリップ");
    expect(draft.contentMarkdown).toContain("出典: [notaurl](notaurl)");
    expect(draft.contentMarkdown).toContain("取り込み日時: 2026-07-31T00:00:00.000Z");
    expect(draft.contentMarkdown).toContain("本文を取り込めませんでした。出典リンクは残してあるので、あとからやり直せます。");
  });

  test("writes Polish labels when the page cannot be fetched", async () => {
    const draft = await buildMobileWebClipDraft("notaurl", {
      capturedAt: new Date("2026-07-31T00:00:00.000Z"),
      fetcher: async () => {
        throw new Error("offline");
      },
      locale: "pl",
    });

    expect(draft.title).toBe("Wycinek strony");
    expect(draft.contentMarkdown).toContain("Źródło: [notaurl](notaurl)");
    expect(draft.contentMarkdown).toContain("Zapisano: 2026-07-31T00:00:00.000Z");
  });
});
