import { describe, expect, test } from "bun:test";
import { createDefaultDiagramDocument, parseDiagramDocument, serializeDiagramDocument } from "./diagram.ts";
import {
  createDefaultInfographicDocument,
  getInfographicSummary,
  InfographicAgentRequestSchema,
  infographicRequestsTimeline,
  parseInfographicDocument,
  serializeInfographicDocument,
} from "./infographic.ts";

describe("infographic note format", () => {
  test("round trips AntV syntax and keeps a readable fallback", () => {
    const document = {
      schemaVersion: 1,
      syntax: "infographic list-row-simple-horizontal-arrow\ndata\n  title 釋出流程\n  lists\n    - label 準備\n    - label 釋出",
    };
    const markdown = serializeInfographicDocument(document);
    expect(markdown).toContain("```infographic\n");
    expect(parseInfographicDocument(markdown)).toEqual(document);
    expect(getInfographicSummary(markdown)).toEqual({ infographic: true });
  });

  test("empty and invalid notes do not claim a valid document", () => {
    expect(parseInfographicDocument(serializeInfographicDocument(createDefaultInfographicDocument()))).toEqual(createDefaultInfographicDocument());
    expect(parseInfographicDocument("<!-- edgeever-infographic-v1:broken -->")).toBeNull();
    expect(getInfographicSummary("regular note")).toEqual({ infographic: false });
  });

  test("keeps AI revision requests with the infographic across reads", () => {
    const document = {
      schemaVersion: 1,
      syntax: "infographic sequence-steps-simple\ndata\n  title 釋出流程",
      history: [
        { id: "one", prompt: "做一個釋出流程圖", createdAt: "2026-09-24T10:00:00.000Z", kind: "generated", resultTitle: "釋出流程" },
        { id: "two", prompt: "把第二步改成稽核", createdAt: "2026-09-24T10:01:00.000Z", kind: "refined", resultTitle: "釋出流程", undoneAt: "2026-09-24T10:02:00.000Z" },
      ],
    };
    expect(parseInfographicDocument(serializeInfographicDocument(document))).toEqual(document);
    expect(parseInfographicDocument(serializeInfographicDocument({ ...document, history: [{ ...document.history[0], prompt: 42 }] }))).toBeNull();
  });

  test("keeps agent replies and clarification turns in the note", () => {
    const document = { schemaVersion: 1, syntax: "", history: [
      { id: "clarify", prompt: "換一家", response: "你想換成哪家公司？", kind: "clarified", resultTitle: "", createdAt: "2026-09-24T10:00:00.000Z" },
      { id: "edit", prompt: "阿里巴巴", response: "已替換對比物件。", decision: "對比關係未變，因此沿用原模板。", kind: "refined", resultTitle: "騰訊 vs 阿里巴巴", template: "compare-binary-horizontal-badge-card-vs", createdAt: "2026-09-24T10:01:00.000Z" },
    ] };
    expect(parseInfographicDocument(serializeInfographicDocument(document))).toEqual(document);
    expect(InfographicAgentRequestSchema.safeParse({ prompt: "修改", currentContent: "", candidates: ["compare-binary-horizontal-badge-card-vs"], history: [{ prompt: "原請求", response: "原回覆" }] }).success).toBe(true);
    expect(InfographicAgentRequestSchema.safeParse({ prompt: "修改", currentContent: "", candidates: [], history: [] }).success).toBe(false);
  });

  test("recognizes a request to replace a comparison with one company's timeline", () => {
    expect(infographicRequestsTimeline("給我換成位元組的發展歷程")).toBe(true);
    expect(infographicRequestsTimeline("按時間順序展示位元組的發展史")).toBe(true);
    expect(infographicRequestsTimeline("把位元組跳動換成阿里巴巴")).toBe(false);
    expect(infographicRequestsTimeline("對比騰訊和位元組的發展歷程")).toBe(false);
    expect(infographicRequestsTimeline("把標題改成發展歷程")).toBe(false);
  });

  test("infographic syntax and visual diagram IR keep separate envelopes", () => {
    const infographic = serializeInfographicDocument({ schemaVersion: 1, syntax: "infographic sequence-steps-simple\ndata\n  sequences\n    - label 開始" });
    const diagram = serializeDiagramDocument(createDefaultDiagramDocument("flowchart"));
    expect(parseInfographicDocument(infographic)?.syntax).toContain("sequence-steps-simple");
    expect(parseDiagramDocument(infographic)).toBeNull();
    expect(parseDiagramDocument(diagram)?.kind).toBe("flowchart");
    expect(parseInfographicDocument(diagram)).toBeNull();
  });
});
