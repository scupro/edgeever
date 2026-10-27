import { readFileSync } from "node:fs";
import { describe, expect, test } from "bun:test";

const read = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

const APP_STORE_LIMITS = {
  name: 30,
  subtitle: 30,
  promotionalText: 170,
  description: 4000,
  keywords: 100,
  whatsNew: 4000,
};

const PLAY_LIMITS = {
  title: 50,
  shortDescription: 80,
  fullDescription: 4000,
};

const field = (source: string, label: string) => {
  const match = source.match(new RegExp(`^- ${label}: (.+)$`, "m"));
  if (!match) {
    throw new Error(`Missing field: ${label}`);
  }
  return match[1].trim();
};

const headingBlock = (source: string, heading: string) => {
  const match = source.match(
    new RegExp(`(?:### |## )${heading}\\n\\n([\\s\\S]*?)(?:\\n\\n(?:### |## )|\\n## |$)`),
  );
  if (!match) {
    throw new Error(`Missing heading: ${heading}`);
  }
  return match[1].trim();
};

describe("App Store listing copy", () => {
  const english = read("apps/mobile/store-assets/app-store/metadata.en-US.md");
  const chinese = read("apps/mobile/store-assets/app-store/metadata.zh-TW.md");
  const japanese = read("apps/mobile/store-assets/app-store/metadata.ja.md");

  test("keeps Japanese fields within App Store Connect limits", () => {
    expect(field(japanese, "Name").length).toBeLessThanOrEqual(APP_STORE_LIMITS.name);
    expect(field(japanese, "Subtitle").length).toBeLessThanOrEqual(APP_STORE_LIMITS.subtitle);
    expect(headingBlock(japanese, "Promotional text").length).toBeLessThanOrEqual(
      APP_STORE_LIMITS.promotionalText,
    );
    expect(headingBlock(japanese, "Description").length).toBeLessThanOrEqual(
      APP_STORE_LIMITS.description,
    );
    expect(headingBlock(japanese, "Keywords").length).toBeLessThanOrEqual(APP_STORE_LIMITS.keywords);
    expect(headingBlock(japanese, "What's New").length).toBeLessThanOrEqual(APP_STORE_LIMITS.whatsNew);
  });

  test("points Japanese listing URLs at the English site and keeps the Evernote disclaimer", () => {
    expect(field(japanese, "Privacy policy URL")).toBe("https://dogbro.store/en/privacy");
    expect(japanese).toContain("https://dogbro.store/en/contact");
    expect(japanese).toContain("https://dogbro.store/en/");
    expect(headingBlock(japanese, "Description")).toContain("Evernote Corporation");
    expect(headingBlock(japanese, "Keywords")).not.toContain("Evernote");
  });

  test("keeps App Review demo credentials in every App Store locale file", () => {
    for (const source of [english, chinese, japanese]) {
      expect(source).toContain("https://demo.dogbro.store");
      expect(source).toContain("ee-demo");
      expect(source).toContain("demo#dZ6Q29Zjfor%");
      expect(source).not.toContain("notes.example.com");
    }
  });
});

describe("Google Play listing copy", () => {
  const english = read("apps/mobile/store-assets/play/metadata.en-US.md");
  const chinese = read("apps/mobile/store-assets/play/metadata.zh-TW.md");
  const japanese = read("apps/mobile/store-assets/play/metadata.ja-JP.md");

  test("keeps Play listing fields within Console limits", () => {
    for (const [source, titleHeading, shortHeading, fullHeading] of [
      [english, "Title", "Short description", "Full description"],
      [chinese, "標題", "簡短說明", "完整說明"],
      [japanese, "Title", "Short description", "Full description"],
    ] as const) {
      expect(headingBlock(source, titleHeading).length).toBeLessThanOrEqual(PLAY_LIMITS.title);
      expect(headingBlock(source, shortHeading).length).toBeLessThanOrEqual(
        PLAY_LIMITS.shortDescription,
      );
      expect(headingBlock(source, fullHeading).length).toBeLessThanOrEqual(
        PLAY_LIMITS.fullDescription,
      );
    }
  });

  test("tells Japanese Play users that a self-hosted instance is required", () => {
    expect(headingBlock(japanese, "Full description")).toContain("セルフホスト");
    expect(headingBlock(japanese, "Full description")).toContain("dogbro.store");
  });
});
