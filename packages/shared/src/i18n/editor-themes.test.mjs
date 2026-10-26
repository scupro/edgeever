import { describe, expect, test } from "bun:test";
import { zhTW } from "./zh-TW.ts";

describe("editor theme labels", () => {
  test("keeps Chinese preset names at four characters", () => {
    for (const [id, label] of Object.entries(zhTW.settings.editorThemes)) {
      expect(label, id).toHaveLength(4);
    }
    expect(zhTW.settings.customEditorTheme.defaultName).toHaveLength(4);
  });
});
