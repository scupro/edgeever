import { describe, expect, test } from "bun:test";
import { desktopMenuCopy } from "./desktop-menu.mjs";

describe("desktop native menu localization", () => {
  test("uses Chinese labels for Chinese Windows locales", () => {
    const copy = desktopMenuCopy("zh-TW");
    expect(copy.file).toBe("檔案");
    expect(copy.edit).toBe("編輯");
    expect(copy.view).toBe("檢視");
    expect(copy.window).toBe("視窗");
    expect(copy.restartToUpdate).toBe("重啟以更新");
    expect(copy.screenshotToNote).toBe("擷取螢幕到筆記");
  });

  test("recognizes other Chinese locale variants", () => {
    expect(desktopMenuCopy("zh-TW").newMemo).toBe("新建筆記");
  });

  test("falls back to English for other or missing locales", () => {
    expect(desktopMenuCopy("en-US").file).toBe("File");
    expect(desktopMenuCopy(undefined).file).toBe("File");
  });
});
