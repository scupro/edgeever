import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const readSource = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const androidAssistantSource = readSource("../apps/mobile/src/components/MobileAiAssistantModal.tsx");
const androidEditorSource = readSource("../apps/mobile/src/components/LocalTiptapEditor.tsx");
const androidDetailSource = readSource("../apps/mobile/src/screens/WorkspaceMemoDetail.tsx");
const androidWorkspaceSource = [
  readSource("../apps/mobile/src/screens/WorkspaceScreen.tsx"),
  readSource("../apps/mobile/src/screens/WorkspaceEditors.tsx"),
  readSource("../apps/mobile/src/screens/WorkspacePickers.tsx"),
].join("\n");
const androidSessionSource = readSource("../apps/mobile/src/lib/session.tsx");

describe("native mobile AI note assistant", () => {
  test("exposes all five first-version actions on Android", () => {
    for (const action of [
      "summarize",
      "extract-key-points",
      "extract-todos",
      "rewrite-proofread",
      "translate",
    ]) {
      expect(androidAssistantSource).toContain(`"${action}"`);
    }
  });

  test("streams AI output from the shared workspace configuration on both clients", () => {
    expect(androidAssistantSource).toContain("resolveAiAssistantOpenAction");
    expect(androidAssistantSource).toContain("readMobileAiAssistantLastAction");
    expect(androidEditorSource).toContain("readStoredAiAssistantLastActionPreference");
    expect(androidEditorSource).toContain("resolveAiAssistantOpenAction");

    expect(androidAssistantSource).toContain("client!.listAiPrompts(resolvedLocale)");
    expect(androidAssistantSource).toContain("client.streamAiGeneration(");
    expect(androidAssistantSource).toContain("promptId: selectedPrompt.id");
    expect(androidWorkspaceSource).toContain("aiPromptsJson={aiPromptsJson}");
    expect(androidEditorSource).toContain("...(promptId ? { promptId } : {})");
    expect(androidSessionSource).toContain("fetch: expoFetch as typeof fetch");
    expect(androidSessionSource).toContain("directAiGeneration: true");
  });

  test("keeps AI output as a draft until append or replace is confirmed", () => {
    expect(androidAssistantSource).toContain('apply("append")');
    expect(androidAssistantSource).toContain('apply("replace")');
    expect(androidWorkspaceSource).toContain("localUpdateMemoMutation.mutateAsync");
    expect(androidWorkspaceSource).toContain("contentJson: markdownToDoc(contentMarkdown)");

  });

  test("keeps the assistant reachable from each native note action menu", () => {
    expect(androidDetailSource).toContain('label={resolvedLocale !== "zh-TW" ? "AI note assistant" : "AI 筆記助手"}');
    expect(androidDetailSource).toContain("setAiAssistantOpen(true)");
    expect(androidDetailSource).toContain("<MobileAiAssistantModal");
  });

  test("suggests tags from native drafts and merges them without duplicates", () => {
    expect(androidWorkspaceSource).toContain("client.suggestAiTags({");
    expect(androidWorkspaceSource).toContain("contentMarkdown,");
    expect(androidWorkspaceSource).toContain("currentTags: selectedTags");
    expect(androidWorkspaceSource).toContain("onChange(Array.from(new Set([...selectedTags, ...additions])).slice(0, 24))");

  });
});
