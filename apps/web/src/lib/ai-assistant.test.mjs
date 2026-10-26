import { describe, expect, test } from "bun:test";
import {
  buildAiAssistantRequest,
  buildAiRefinementInstruction,
  canReplaceAiSource,
  getDefaultAiAction,
  getDefaultTargetLanguage,
  parseDefaultAiPromptKey,
  resolveAiAssistantComposerInput,
} from "./ai-assistant.ts";

describe("AI assistant interaction model", () => {
  test("chooses a useful default from the current scope and locale", () => {
    expect(getDefaultAiAction(true)).toBe("improve-writing");
    expect(getDefaultAiAction(false)).toBe("custom");
    expect(getDefaultTargetLanguage("zh-TW")).toBe("en");
    expect(getDefaultTargetLanguage("en-US")).toBe("zh-TW");
  });

  test("sends the visible instruction with the semantic action key", () => {
    expect(buildAiAssistantRequest({
      action: "make-shorter",
      contentMarkdown: "Long draft",
      customInstruction: "把內容改寫得更簡潔。",
      targetLanguage: "en",
      title: "Draft",
      tone: "professional",
    })).toEqual({
      action: "make-shorter",
      title: "Draft",
      contentMarkdown: "Long draft",
      instruction: "把內容改寫得更簡潔。",
    });
    expect(buildAiAssistantRequest({
      action: "translate",
      contentMarkdown: "Hello",
      customInstruction: "將完整筆記翻譯成使用者指定的目標語言。",
      targetLanguage: "en",
      title: "Draft",
      tone: "professional",
    })).toMatchObject({
      action: "translate",
      targetLanguage: "en",
      instruction: "將完整筆記翻譯成使用者指定的目標語言。",
    });
  });

  test("sends saved prompt identity and explicit parameters without duplicating its instruction", () => {
    expect(buildAiAssistantRequest({
      action: "custom",
      contentMarkdown: "Hello",
      customInstruction: "A stale client-side copy that must not be trusted.",
      locale: "en-US",
      parameterKind: "target-language",
      promptId: "aiprompt_translate_for_clients",
      targetLanguage: "zh-TW",
      title: "Draft",
      tone: "professional",
    })).toEqual({
      action: "custom",
      promptId: "aiprompt_translate_for_clients",
      locale: "en-US",
      title: "Draft",
      contentMarkdown: "Hello",
      targetLanguage: "zh-TW",
    });
  });

  test("includes temporary attachments only when present", () => {
    const attachment = {
      filename: "brief.txt",
      mediaType: "text/plain",
      base64Data: "SGVsbG8=",
    };
    expect(buildAiAssistantRequest({
      action: "custom",
      attachments: [attachment],
      contentMarkdown: "",
      customInstruction: "Summarize the file.",
      targetLanguage: "en",
      title: "",
      tone: "professional",
    })).toMatchObject({ attachments: [attachment] });
  });

  test("sends a custom instruction when generating from a blank note", () => {
    expect(buildAiAssistantRequest({
      action: "custom",
      contentMarkdown: "",
      customInstruction: "Write a friendly greeting email.",
      targetLanguage: "en",
      title: "",
      tone: "professional",
    })).toEqual({
      action: "custom",
      title: "",
      contentMarkdown: "",
      instruction: "Write a friendly greeting email.",
    });
  });

  test("uses retained composer text as the source only when the note is empty", () => {
    expect(resolveAiAssistantComposerInput({
      composerText: "寫一首詩",
      isFreeformCustom: false,
      noteContentMarkdown: "",
      noteTitle: "",
    })).toEqual({
      contentMarkdown: "寫一首詩",
      customInstruction: "",
      title: "",
      usesComposerAsSource: true,
    });
    expect(resolveAiAssistantComposerInput({
      composerText: "寫一首詩",
      isFreeformCustom: false,
      noteContentMarkdown: "整篇筆記不應被翻譯",
      noteTitle: "現有筆記",
    })).toEqual({
      contentMarkdown: "整篇筆記不應被翻譯",
      customInstruction: "",
      title: "現有筆記",
      usesComposerAsSource: false,
    });
    expect(resolveAiAssistantComposerInput({
      composerText: "這段不應覆蓋選區",
      hasSelection: true,
      isFreeformCustom: false,
      noteContentMarkdown: "選中的句子",
      noteTitle: "現有筆記",
    })).toEqual({
      contentMarkdown: "選中的句子",
      customInstruction: "",
      title: "現有筆記",
      usesComposerAsSource: false,
    });
    expect(resolveAiAssistantComposerInput({
      composerText: "",
      isFreeformCustom: false,
      noteContentMarkdown: "留空時處理整篇筆記",
      noteTitle: "現有筆記",
    })).toEqual({
      contentMarkdown: "留空時處理整篇筆記",
      customInstruction: "",
      title: "現有筆記",
      usesComposerAsSource: false,
    });
  });

  test("keeps translation refinements in the selected target language", () => {
    expect(buildAiRefinementInstruction({
      originalAction: "translate",
      originalInstruction: "Translate the complete note into the selected language.",
      refinement: "更自然",
      targetLanguage: "en",
    })).toBe([
      "Revise only the supplied current result according to the follow-up request.",
      "Continue the original processing task instead of starting a different task. Preserve the result's language, purpose, factual meaning, and useful formatting unless the follow-up explicitly requests a change.",
      "Original processing action:\ntranslate",
      "Original processing instruction:\nTranslate the complete note into the selected language.",
      "Keep the entire revised result in the target language: en. Do not translate it back to the language used by the follow-up request.",
      "Follow-up request:\n更自然",
    ].join("\n\n"));
  });

  test("keeps every processing action and its original instruction during refinement", () => {
    const actions = [
      "summarize",
      "extract-key-points",
      "extract-todos",
      "rewrite-proofread",
      "improve-writing",
      "fix-spelling-grammar",
      "make-shorter",
      "make-longer",
      "simplify-language",
      "continue-writing",
      "custom",
    ];

    for (const originalAction of actions) {
      const instruction = buildAiRefinementInstruction({
        originalAction,
        originalInstruction: `Original instruction for ${originalAction}`,
        refinement: "再簡潔一點",
      });
      expect(instruction).toContain(`Original processing action:\n${originalAction}`);
      expect(instruction).toContain(`Original processing instruction:\nOriginal instruction for ${originalAction}`);
      expect(instruction).toContain("Follow-up request:\n再簡潔一點");
    }
  });

  test("keeps the selected tone while refining tone changes", () => {
    const instruction = buildAiRefinementInstruction({
      originalAction: "change-tone",
      originalInstruction: "Rewrite the content in the selected tone.",
      refinement: "再短一點",
      tone: "friendly",
    });

    expect(instruction).toContain("Original processing action:\nchange-tone");
    expect(instruction).toContain("Keep the revised result in the requested tone: friendly.");
    expect(instruction).toContain("Follow-up request:\n再短一點");
  });

  test("keeps extractive output additive while allowing rewritten content to replace its source", () => {
    expect(canReplaceAiSource("summarize")).toBe(false);
    expect(canReplaceAiSource("continue-writing")).toBe(false);
    expect(canReplaceAiSource("translate")).toBe(true);
    expect(canReplaceAiSource("custom")).toBe(true);
  });

  test("parses seed keys from deterministic prompt ids", () => {
    expect(parseDefaultAiPromptKey("ws_1_aiprompt_summarize")).toBe("summarize");
    expect(parseDefaultAiPromptKey("aiprompt_abc123")).toBe(null);
  });
});
