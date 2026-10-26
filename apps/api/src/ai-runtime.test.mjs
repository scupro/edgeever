import { describe, expect, test } from "bun:test";
import { openaiCompatibleHeaders } from "../../../packages/client/src/ai-model.ts";
import { parseAiTagSuggestionNames } from "@edgeever/shared";

describe("OpenAI-compatible provider headers", () => {
  test("identifies OpenRouter so rankings and tool routes stay attributed", () => {
    expect(openaiCompatibleHeaders("https://openrouter.ai/api/v1")).toEqual({
      "HTTP-Referer": "https://edgeever.org",
      "X-Title": "EdgeEver",
    });
    expect(openaiCompatibleHeaders("https://api.openai.com/v1")).toBeUndefined();
  });
});

describe("AI tag response parsing", () => {
  test("parses the requested suggestions object", () => {
    expect(parseAiTagSuggestionNames('{"suggestions":["React","AI"]}'))
      .toEqual(["React", "AI"]);
  });

  test("accepts common compatible-model JSON variations", () => {
    expect(parseAiTagSuggestionNames('```json\n["React", "AI"]\n```'))
      .toEqual(["React", "AI"]);
    expect(parseAiTagSuggestionNames('Result: {"tags":[{"name":"React"},{"tag":"AI"}]}'))
      .toEqual(["React", "AI"]);
  });

  test("accepts the reasoning-model-safe tag block", () => {
    expect(parseAiTagSuggestionNames(`Analysis omitted.\n<edgeever-tags>\n歷史人物\n輕小說\n跨界創作\n</edgeever-tags>`))
      .toEqual(["歷史人物", "輕小說", "跨界創作"]);
  });

  test("accepts plain tag lines from compatible models but drops explanatory prose", () => {
    expect(parseAiTagSuggestionNames("以下是建議標籤：\n歷史人物\n日本輕小說"))
      .toEqual(["歷史人物", "日本輕小說"]);
    expect(parseAiTagSuggestionNames("日本輕小說")).toEqual(["日本輕小說"]);
  });

  test("accepts concise delimited tags from models that ignore the requested block", () => {
    expect(parseAiTagSuggestionNames("標籤：軍人婚姻、少數民族加分、政策公平"))
      .toEqual(["軍人婚姻", "少數民族加分", "政策公平"]);
    expect(parseAiTagSuggestionNames("React, AI")).toEqual(["React", "AI"]);
    expect(parseAiTagSuggestionNames("沒有合適的標籤。 ")).toEqual([]);
  });

  test("scans past reasoning braces to find a later suggestions object", () => {
    expect(parseAiTagSuggestionNames('Reasoning {not json}. Result: {"tags":["React","AI"]}'))
      .toEqual(["React", "AI"]);
  });

  test("rejects prose instead of treating it as tag data", () => {
    expect(() => parseAiTagSuggestionNames("This note discusses React, AI, and several implementation tradeoffs."))
      .toThrow("requested tag block");
    expect(() => parseAiTagSuggestionNames('{"answer":"React"}'))
      .toThrow("requested tag block");
  });

  test("caps provider output at three suggestions before route-level normalization", () => {
    expect(parseAiTagSuggestionNames(JSON.stringify({
      suggestions: ["1", "2", "3", "4", "5", "6", "7", "8"],
    }))).toEqual(["1", "2", "3"]);
  });
});
