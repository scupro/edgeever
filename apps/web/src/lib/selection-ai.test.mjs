import { describe, expect, test } from "bun:test";
import {
  SELECTION_AI_SEND_LIMIT,
  clipSelectionForSend,
  selectionAiUserMessage,
  translationReplacement,
} from "./selection-ai.ts";

describe("selection send clip", () => {
  test("keeps a short passage intact", () => {
    expect(clipSelectionForSend("概念")).toEqual({ sentText: "概念", truncated: false });
  });

  test("clips to the send limit without splitting an emoji", () => {
    const emoji = "😀";
    const text = `${"a".repeat(SELECTION_AI_SEND_LIMIT - 1)}${emoji}`;
    const clipped = clipSelectionForSend(text);
    expect(clipped.truncated).toBe(true);
    expect(clipped.sentText).toBe("a".repeat(SELECTION_AI_SEND_LIMIT - 1));
    expect(clipped.sentText.length).toBeLessThanOrEqual(SELECTION_AI_SEND_LIMIT);
  });

  test("keeps a passage that already fits, including a trailing emoji", () => {
    const text = `${"a".repeat(SELECTION_AI_SEND_LIMIT - 2)}😀`;
    expect(text.length).toBe(SELECTION_AI_SEND_LIMIT);
    expect(clipSelectionForSend(text).truncated).toBe(false);
  });
});

describe("translation replacement", () => {
  test("uses the whole reply when it is only the translation", () => {
    expect(translationReplacement("  Hello there.  ")).toBe("Hello there.");
  });

  test("preserves a short first paragraph in a multi-paragraph translation", () => {
    const response = "First paragraph.\n\nSecond paragraph.";
    expect(translationReplacement(response)).toBe(response);
  });

  test("keeps a long or multi-line opening", () => {
    const long = `${"This opening is longer than eighty characters, so the whole reply stays in the replacement."}\n\nNext`;
    expect(long.split("\n")[0].length).toBeGreaterThan(80);
    expect(translationReplacement(long)).toBe(long.trim());
    expect(translationReplacement("Line one\nline two\n\nBody")).toBe("Line one\nline two\n\nBody");
  });

  test("returns nothing for a blank reply", () => {
    expect(translationReplacement("  \n")).toBe("");
  });
});

describe("selection user message", () => {
  test("places the truncation notice before the quote", () => {
    expect(selectionAiUserMessage({
      instruction: "請解釋下面這段文字。",
      notice: "只傳送了選區的前 2000 個字元。",
      quote: "概念",
    })).toBe("請解釋下面這段文字。\n\n只傳送了選區的前 2000 個字元。\n\n概念");
  });

  test("stays inside the companion message limit for a full clip", () => {
    const message = selectionAiUserMessage({
      instruction: "請翻譯下面這段文字：如果原文是正體中文，譯成英文；否則譯成正體中文。只輸出譯文。",
      notice: "只傳送了選區的前 2000 個字元。",
      quote: "字".repeat(SELECTION_AI_SEND_LIMIT),
    });
    expect(message.length).toBeLessThanOrEqual(4000);
    expect(message.endsWith("字".repeat(SELECTION_AI_SEND_LIMIT))).toBe(true);
  });
});
