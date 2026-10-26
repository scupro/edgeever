import { describe, expect, test } from "bun:test";
import {
  MOBILE_EDITOR_ACTIVE_FLAGS,
  MOBILE_EDITOR_TOOLBAR_ACTIONS,
  getMobileEditorInputAttributes,
  getMobileEditorImageScaleLabel,
  getMobileEditorImageWidthPresetLabel,
  getMobileEditorPlaceholder,
  getMobileEditorToolbarActionLabel,
  getMobileEditorToolbarLabel,
} from "./mobile-editor.ts";

describe("mobile editor contract", () => {
  test("keeps undo and redo at the start of the mobile toolbar", () => {
    expect(MOBILE_EDITOR_TOOLBAR_ACTIONS.map(({ id }) => id)).toEqual([
      "undo",
      "redo",
      "image",
      "bold",
      "bulletList",
      "taskList",
      "increaseListIndent",
      "decreaseListIndent",
      "blockquote",
      "horizontalRule",
    ]);
    expect(MOBILE_EDITOR_TOOLBAR_ACTIONS.find(({ id }) => id === "bold")?.activeFlag).toBe(
      MOBILE_EDITOR_ACTIVE_FLAGS.bold
    );
  });

  test("provides the same localized copy to both mobile clients", () => {
    expect(getMobileEditorPlaceholder("zh-TW")).toBe("開始記錄...");
    expect(getMobileEditorPlaceholder("en-US")).toBe("Start writing...");
    expect(getMobileEditorToolbarLabel("zh-TW")).toBe("編輯器工具欄");
    expect(getMobileEditorToolbarActionLabel("undo", "zh-TW")).toBe("撤銷");
    expect(getMobileEditorToolbarActionLabel("redo", "en-US")).toBe("Redo");
    expect(getMobileEditorToolbarActionLabel("undo", "ja")).toBe("元に戻す");
    expect(getMobileEditorToolbarActionLabel("bulletList", "en-US")).toBe("Bullet list");
    expect(getMobileEditorToolbarActionLabel("taskList", "zh-TW")).toBe("任務清單");
    expect(getMobileEditorToolbarActionLabel("increaseListIndent", "zh-TW")).toBe("增加列表層級（Tab）");
    expect(getMobileEditorToolbarActionLabel("decreaseListIndent", "en-US")).toBe("Decrease list level (Shift + Tab)");
    expect(getMobileEditorImageScaleLabel("zh-TW")).toBe("圖片顯示尺寸");
    expect(getMobileEditorImageWidthPresetLabel("medium", "en-US")).toBe("Medium");
  });

  test("keeps mobile typing assistance enabled", () => {
    expect(getMobileEditorInputAttributes("editor-content")).toEqual({
      autocapitalize: "sentences",
      autocomplete: "on",
      autocorrect: "on",
      class: "editor-content",
      inputmode: "text",
      spellcheck: "true",
    });
  });
});
