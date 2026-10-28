import { describe, expect, test } from "bun:test";
import { buildGitHubFeedbackUrl } from "../packages/shared/src/github-feedback";

describe("buildGitHubFeedbackUrl", () => {
  test("prefills localized feedback copy and system information", () => {
    const url = new URL(
      buildGitHubFeedbackUrl({
        contentHeading: "反饋內容",
        contentPrompt: "請描述問題",
        privacyNotice: "請勿提交隱私資訊",
        systemInfo: [
          { label: "版本號", value: "v0.5.0" },
          { label: "系統", value: "Android 16" },
        ],
        systemInfoHeading: "系統資訊",
        systemInfoNotice: "自動生成",
        titlePrefix: "[反饋] ",
      })
    );

    expect(`${url.origin}${url.pathname}`).toBe("https://github.com/scupro/edgeever/issues/new");
    expect(url.searchParams.get("title")).toBe("[反饋] ");
    expect(url.searchParams.get("body")).toContain("## 反饋內容");
    expect(url.searchParams.get("body")).toContain("- 版本號: v0.5.0");
    expect(url.searchParams.get("body")).toContain("- 系統: Android 16");
    expect(url.searchParams.get("body")).toContain("> 請勿提交隱私資訊");
    expect(url.searchParams.get("system-info")).toContain("- 版本號: v0.5.0");
    expect(url.searchParams.get("system-info")).toContain("- 系統: Android 16");
    expect(url.searchParams.get("template")).toBeNull();
  });
});
