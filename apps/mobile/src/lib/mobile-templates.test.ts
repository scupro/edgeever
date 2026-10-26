import { describe, expect, test } from "bun:test";
import {
  createMemoSeedHasContent,
  mobileTemplateToCreateSeed,
  toMobileSelectableTemplate,
} from "./mobile-templates";

describe("mobile-templates", () => {
  test("maps a persisted template to a selectable row", () => {
    const selectableSaved = toMobileSelectableTemplate(
      {
        id: "tpl_1",
        name: "我的週報",
        description: "團隊週報",
        title: "【週報】",
        contentJson: { type: "doc", content: [] },
        contentMarkdown: "## 本週",
        tags: ["work", "weekly"],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    );
    expect(selectableSaved.title).toBe("【週報】");
    expect(mobileTemplateToCreateSeed(selectableSaved)).toEqual({
      title: "【週報】",
      contentMarkdown: "## 本週",
      tagsText: "work, weekly",
    });
  });

  test("detects whether a seed has user content", () => {
    expect(createMemoSeedHasContent({ title: "", contentMarkdown: "", tagsText: "" })).toBe(false);
    expect(createMemoSeedHasContent({ title: "a", contentMarkdown: "", tagsText: "" })).toBe(true);
    expect(createMemoSeedHasContent({ title: "", contentMarkdown: "x", tagsText: "" })).toBe(true);
    expect(createMemoSeedHasContent({ title: "", contentMarkdown: "", tagsText: "tag" })).toBe(true);
  });
});
