import { describe, expect, test } from "bun:test";
import { parseSyntax, getTemplate, getTemplates } from "@antv/infographic";
import { compileInfographicNote, INFOGRAPHIC_NOTE_TEMPLATES } from "@edgeever/shared";
import {
  buildInfographicSyntax,
  buildOfficialInfographicSyntax,
  generatedInfographicSyntax,
  infographicAgentCandidates,
  inferInfographicFamily,
  inferInfographicKind,
  infographicFamilyChoices,
  officialTemplateFamily,
  infographicNoteTitleIsAutomatic,
  infographicSyntaxTitle,
  nextInfographicNoteTitle,
  parseGeneratedInfographicContent,
  parseGeneratedOfficialData,
  parseGeneratedOfficialSelection,
  parseInfographicEditDecision,
  parseInfographicFamilyDecision,
  resolveInfographicEditSelection,
  resolveInfographicTemplateSelection,
  requestsInfographicLayoutChange,
  requestsInfographicFamilyChange,
  sampleOfficialData,
  selectableInfographicTemplates,
  shortlistOfficialTemplates,
  shouldReplaceExistingInfographic,
  templateForRequest,
} from "./infographic-generation.ts";

describe("infographic generation", () => {
  test("a four-quadrant request produces AntV's compares array", () => {
    const output = '```json\n{"kind":"steps","title":"優先順序四象限","items":[{"label":"立即做","description":"重要且緊急"},{"label":"計劃做","description":"重要不緊急"},{"label":"委派","description":"緊急不重要"},{"label":"不做","description":"不重要不緊急"}]}\n```';
    const content = parseGeneratedInfographicContent(output, "給我生成一個四象限圖");
    expect(inferInfographicKind("給我生成一個四象限圖")).toBe("quadrant");
    expect(content?.kind).toBe("quadrant");
    const syntax = generatedInfographicSyntax(content);
    expect(syntax).toContain("infographic compare-quadrant-quarter-simple-card\ndata\n");
    expect(syntax).toContain("  compares\n    - label 立即做");
    const parsed = parseSyntax(syntax);
    expect(parsed.errors).toEqual([]);
    expect(getTemplate(parsed.options.template)).toBeTruthy();
  });

  test("offered styles are real AntV templates and match their data family", () => {
    const official = new Set(getTemplates());
    for (const { id: template, kind } of selectableInfographicTemplates) {
      expect(official.has(template)).toBe(true);
      const items = kind === "quadrant" ? Array.from({ length: 4 }, (_, index) => ({ label: `第${index + 1}項`, description: "說明" }))
        : kind === "comparison" ? [{ label: "A", children: [{ label: "維度", description: "說明" }] }, { label: "B", children: [{ label: "維度", description: "說明" }] }]
        : [{ label: "第一項", description: "說明" }];
      const syntax = buildInfographicSyntax({ template, title: "測試", items });
      expect(parseSyntax(syntax).errors).toEqual([]);
    }
  });

  test("the model can choose a compatible official style but cannot cross data families", () => {
    const request = "生成一個位元組和騰訊的對比圖";
    const data = { kind: "comparison", template: "compare-binary-horizontal-compact-card-vs", title: "對比", items: [{ label: "位元組" }, { label: "騰訊" }] };
    expect(parseGeneratedInfographicContent(JSON.stringify(data), request)?.template).toBe(data.template);
    expect(parseGeneratedInfographicContent(JSON.stringify({ ...data, template: "sequence-steps-simple" }), request)?.template).toBe("compare-binary-horizontal-badge-card-vs");
    expect(parseGeneratedInfographicContent(JSON.stringify({ ...data, items: ["A", "B", "C", "D"] }), "換成圓形四象限圖")?.template).toBe("compare-quadrant-quarter-circular");
    expect(parseGeneratedInfographicContent(JSON.stringify({ ...data, kind: "list" }), "生成金字塔清單")?.template).toBe("list-pyramid-compact-card");
  });

  test("a new comparison request replaces an existing quadrant with a side-by-side template", () => {
    const request = "生成一個位元組和騰訊的對比圖";
    expect(inferInfographicKind(request)).toBe("comparison");
    expect(shouldReplaceExistingInfographic(request, "quadrant")).toBe(true);
    expect(shouldReplaceExistingInfographic("把第二象限標題改短一點", "quadrant")).toBe(false);
    expect(shouldReplaceExistingInfographic("換成緊湊對比圖版式", "comparison")).toBe(false);
    const output = JSON.stringify({ kind: "quadrant", title: "位元組與騰訊", items: [
      { label: "位元組跳動", description: "內容平臺與推薦技術", children: [{ label: "主要產品", description: "抖音與今日頭條" }, { label: "業務側重", description: "短影片與廣告" }] },
      { label: "騰訊", description: "社交平臺與遊戲業務", children: [{ label: "主要產品", description: "微信與QQ" }, { label: "業務側重", description: "社交與遊戲" }] },
    ] });
    const content = parseGeneratedInfographicContent(output, request);
    expect(content?.kind).toBe("comparison");
    const syntax = generatedInfographicSyntax(content);
    expect(syntax).toContain("infographic compare-binary-horizontal-badge-card-vs");
    expect(syntax).toContain("  compares\n    - label 位元組跳動\n      children\n        - label 位元組跳動");
    expect(syntax).toContain("        - label 主要產品\n          desc 抖音與今日頭條");
    const parsed = parseSyntax(syntax);
    expect(parsed.errors).toEqual([]);
    expect(getTemplate(parsed.options.template)).toBeTruthy();
  });

  test("malformed model content is rejected before reaching AntV", () => {
    expect(parseGeneratedInfographicContent("Expected array value.", "四象限圖")).toBeNull();
    expect(parseGeneratedInfographicContent('{"kind":"quadrant","items":"wrong"}', "四象限圖")).toBeNull();
    expect(parseGeneratedInfographicContent('{"kind":"quadrant","items":[{"label":"A"}]}', "四象限圖")).toBeNull();
  });

  test("all 276 installed AntV templates accept the shared family data format", () => {
    const templates = getTemplates();
    expect(templates).toHaveLength(276);
    for (const template of templates) {
      const sample = sampleOfficialData(template);
      const syntax = buildOfficialInfographicSyntax(template, sample);
      const parsed = parseSyntax(syntax);
      expect(parsed.errors).toEqual([]);
      expect(parsed.options.template).toBe(template);
      expect(parsed.options.data).toEqual(sample);
      expect(getTemplate(template)).toBeTruthy();
      expect(["chart", "comparison", "hierarchy", "list", "quadrant", "relation", "sequence"]).toContain(officialTemplateFamily(template));
    }
  });

  test("explicit chart and diagram requests resolve to installed templates", () => {
    for (const request of ["餅圖", "柱狀圖", "折線圖", "詞雲", "思維導圖", "組織結構", "網路圖"]) {
      expect(getTemplates()).toContain(templateForRequest(request));
    }
  });

  test("AI data is checked for the chosen official template before rendering", () => {
    const quadrant = "compare-quadrant-quarter-simple-card";
    const data = sampleOfficialData(quadrant);
    expect(parseGeneratedOfficialData(JSON.stringify({ data }), quadrant)).toEqual(data);
    expect(parseGeneratedOfficialData(JSON.stringify({ data: { ...data, compares: data.compares.slice(0, 3) } }), quadrant)).toBeNull();
    expect(parseGeneratedOfficialData(JSON.stringify({ data: { title: "壞圖", values: [{ label: "A", value: "abc" }] } }), "chart-column-simple")).toBeNull();
    expect(parseGeneratedOfficialData(JSON.stringify({ data: { title: "重複節點", nodes: [{ id: "a", label: "A" }, { id: "a", label: "B" }] } }), "relation-network-simple-circle-node")).toBeNull();
    expect(parseGeneratedOfficialData(JSON.stringify({ data: { title: "空關係", nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }], relations: [] } }), "relation-network-simple-circle-node")).toBeNull();
    expect(parseGeneratedOfficialData(JSON.stringify({ data: { title: "單側對比", compares: [{ label: "A", children: [{ label: "業務" }] }, { label: "B" }] } }), "compare-binary-horizontal-badge-card-vs")).toBeNull();
  });

  test("AI can select any installed template while an unknown ID is rejected", () => {
    const templates = getTemplates();
    const selected = templates.find((id) => id.startsWith("hierarchy-mindmap-"));
    const data = sampleOfficialData(selected);
    expect(parseGeneratedOfficialSelection(JSON.stringify({ template: selected, data }), templates)).toEqual({ template: selected, data });
    expect(parseGeneratedOfficialSelection(JSON.stringify({ template: "made-up-template", data }), templates)).toBeNull();
  });

  test("AI shortlist uses the relevant family while every official ID remains directly selectable", () => {
    const templates = getTemplates();
    const comparison = shortlistOfficialTemplates("比較位元組和騰訊的產品", templates);
    expect(comparison.length).toBeLessThanOrEqual(12);
    expect(comparison.every((id) => officialTemplateFamily(id) === "comparison")).toBe(true);
    expect(comparison.every((id) => id.endsWith("-vs"))).toBe(true);
    const mindmap = shortlistOfficialTemplates("畫思維導圖", templates);
    expect(mindmap.every((id) => officialTemplateFamily(id) === "hierarchy")).toBe(true);
    expect(templates).toContain("compare-quadrant-quarter-simple-card");
  });

  test("replacing a comparison subject keeps the existing two-sided template", () => {
    const templates = getTemplates();
    const current = "compare-binary-horizontal-badge-card-vs";
    for (const request of ["把位元組給我換成阿里巴巴", "把對比從位元組換成阿里巴巴", "把位元組改成阿里巴巴，其餘不變"]) {
      expect(requestsInfographicLayoutChange(request)).toBe(false);
      expect(shouldReplaceExistingInfographic(request, undefined)).toBe(false);
      expect(resolveInfographicTemplateSelection(request, templates, current)).toEqual({ template: current, candidates: [] });
    }
    const currentData = {
      title: "騰訊 vs 位元組跳動 對比",
      compares: [
        { label: "騰訊", children: [{ label: "核心業務", desc: "社交與遊戲" }] },
        { label: "位元組跳動", children: [{ label: "核心業務", desc: "短影片與推薦" }] },
      ],
    };
    const revisedData = {
      ...currentData,
      title: "騰訊 vs 阿里巴巴 對比",
      compares: [currentData.compares[0], { label: "阿里巴巴", children: [{ label: "核心業務", desc: "電商與雲端計算" }] }],
    };
    const parsed = parseGeneratedOfficialData(JSON.stringify({ data: revisedData }), current);
    expect(parsed?.compares).toEqual(revisedData.compares);
    const syntax = buildOfficialInfographicSyntax(current, parsed);
    expect(parseSyntax(syntax).options.template).toBe(current);
  });

  test("explicit layout changes can select a new style within the current family", () => {
    const templates = getTemplates();
    const current = "compare-binary-horizontal-badge-card-vs";
    expect(resolveInfographicTemplateSelection("換成緊湊對比圖版式", templates, current).template).toBe("compare-binary-horizontal-compact-card-vs");
    const alternative = resolveInfographicTemplateSelection("換個版式", templates, current);
    expect(alternative.template).toBeNull();
    expect(alternative.candidates.length).toBeGreaterThan(0);
    expect(alternative.candidates.every((id) => officialTemplateFamily(id) === "comparison")).toBe(true);
    expect(alternative.candidates).not.toContain(current);
    expect(resolveInfographicTemplateSelection("換個版式，資料保留", templates, current).candidates.every((id) => officialTemplateFamily(id) === "comparison")).toBe(true);
    expect(resolveInfographicTemplateSelection("改成四象限圖", templates, current).candidates.every((id) => officialTemplateFamily(id) === "quadrant")).toBe(true);
  });

  test("a chosen semantic family limits template selection before generation", () => {
    const templates = getTemplates();
    expect(inferInfographicFamily("比較騰訊和阿里巴巴")).toBe("comparison");
    expect(inferInfographicFamily("展示季度收入趨勢")).toBeNull();
    expect(requestsInfographicFamilyChange("換成更合適的圖")).toBe(true);
    expect(resolveInfographicTemplateSelection("展示季度收入趨勢", templates, undefined, "chart").candidates.every((id) => officialTemplateFamily(id) === "chart")).toBe(true);
    expect(resolveInfographicTemplateSelection("產品釋出的時間線", templates, undefined, "sequence").candidates.every((id) => id.startsWith("sequence-timeline-"))).toBe(true);
  });

  test("AI family decisions are validated and uncertain choices are offered to the user", () => {
    const confident = parseInfographicFamilyDecision('{"family":"comparison","confidence":0.91,"ambiguous":false,"alternatives":["list"]}');
    expect(confident?.family).toBe("comparison");
    expect(infographicFamilyChoices(confident)).toEqual([]);
    const uncertain = parseInfographicFamilyDecision('```json\n{"family":"hierarchy","confidence":0.54,"ambiguous":true,"alternatives":["relation","list","invalid"]}\n```');
    expect(infographicFamilyChoices(uncertain)).toEqual(["hierarchy", "relation", "list"]);
    expect(parseInfographicFamilyDecision('{"family":"made-up","confidence":1,"ambiguous":false,"alternatives":[]}')).toBeNull();
    expect(parseInfographicFamilyDecision('{"family":"list","confidence":1.4,"ambiguous":false,"alternatives":[]}')).toBeNull();
    expect(parseInfographicFamilyDecision('{"family":"list","confidence":0.4,"ambiguous":true,"alternatives":[]}')).toBeNull();
  });

  test("semantic edit decisions preserve a comparison subject edit and switch a timeline request", () => {
    const templates = getTemplates();
    const current = "compare-binary-horizontal-badge-card-vs";
    const keep = parseInfographicEditDecision('{"intent":"keep","family":"comparison","confidence":0.97,"ambiguous":false,"alternatives":[]}');
    expect(keep?.intent).toBe("keep");
    expect(resolveInfographicEditSelection("把位元組跳動換成阿里巴巴", templates, current, keep).template).toBe(current);
    const change = parseInfographicEditDecision('{"intent":"change","family":"sequence","confidence":0.93,"ambiguous":false,"alternatives":[]}');
    expect(resolveInfographicEditSelection("按時間順序展示發展歷程", templates, current, change).candidates.every((id) => officialTemplateFamily(id) === "sequence")).toBe(true);
    const layout = parseInfographicEditDecision('{"intent":"layout","family":"list","confidence":0.82,"ambiguous":false,"alternatives":[]}');
    expect(resolveInfographicEditSelection("讓畫面更緊湊", templates, current, layout).candidates.every((id) => officialTemplateFamily(id) === "comparison")).toBe(true);
    expect(resolveInfographicEditSelection("讓畫面更緊湊", templates, current, layout).candidates).not.toContain(current);
    expect(resolveInfographicEditSelection("換成緊湊對比圖版式", templates, current, layout).template).toBe("compare-binary-horizontal-compact-card-vs");
    expect(parseInfographicEditDecision('{"intent":"unknown","family":"sequence","confidence":1,"ambiguous":false,"alternatives":[]}')).toBeNull();
  });

  test("agent shortlist includes the current template and each semantic family", () => {
    const current = "compare-binary-horizontal-badge-card-vs";
    const candidates = infographicAgentCandidates("把位元組跳動換成阿里巴巴", getTemplates(), current);
    expect(candidates[0]).toBe(current);
    expect(candidates.length).toBeLessThanOrEqual(50);
    expect(new Set(candidates.map(officialTemplateFamily))).toEqual(new Set(["chart", "comparison", "hierarchy", "list", "quadrant", "relation", "sequence"]));
  });

  test("companion infographic templates render with AntV", () => {
    for (const template of INFOGRAPHIC_NOTE_TEMPLATES) {
      const compiled = compileInfographicNote(template, sampleOfficialData(template));
      expect(compiled.ok).toBe(true);
      if (!compiled.ok) continue;
      const parsed = parseSyntax(compiled.syntax);
      expect(parsed.errors).toEqual([]);
      expect(parsed.options.template).toBe(template);
      expect(getTemplate(template)).toBeTruthy();
    }
  });

  test("development history prioritizes timeline templates over the current comparison", () => {
    const current = "compare-binary-horizontal-badge-card-vs";
    expect(inferInfographicFamily("給我換成位元組的發展歷程")).toBe("sequence");
    const candidates = infographicAgentCandidates("給我換成位元組的發展歷程", getTemplates(), current);
    expect(candidates[0].startsWith("sequence-timeline-")).toBe(true);
    expect(candidates).toContain(current);
    expect(shortlistOfficialTemplates("給我換成位元組的發展歷程", getTemplates(), current, "sequence").every((id) => id.startsWith("sequence-timeline-"))).toBe(true);
  });

  test("a conversation that changes the infographic subject renames the note", () => {
    expect(nextInfographicNoteTitle({
      noteTitle: "DIKW 知識層級金字塔",
      previousGraphicTitle: "DIKW 知識層級金字塔",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
    })).toBe("騰訊與位元組跳動對比");
    expect(nextInfographicNoteTitle({
      noteTitle: "DIKW 知識層級金字塔",
      previousGraphicTitle: "DIKW 金字塔",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
    })).toBe("騰訊與位元組跳動對比");
    expect(nextInfographicNoteTitle({
      noteTitle: "資訊圖",
      previousGraphicTitle: "",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
    })).toBe("騰訊與位元組跳動對比");
    expect(nextInfographicNoteTitle({
      noteTitle: "競品備忘",
      previousGraphicTitle: "騰訊與位元組跳動對比",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
      keepCustomTitle: true,
    })).toBe("競品備忘");
    expect(nextInfographicNoteTitle({
      noteTitle: "競品備忘",
      previousGraphicTitle: "",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
      keepCustomTitle: true,
    })).toBe("競品備忘");
    expect(nextInfographicNoteTitle({
      noteTitle: "DIKW 知識層級金字塔",
      previousGraphicTitle: "騰訊與位元組跳動對比",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
    })).toBe("騰訊與位元組跳動對比");
    expect(nextInfographicNoteTitle({
      noteTitle: "競品備忘",
      previousGraphicTitle: "DIKW 知識層級金字塔",
      nextGraphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
      keepCustomTitle: true,
    })).toBe("騰訊與位元組跳動對比");
    expect(infographicSyntaxTitle("infographic list-row-simple-horizontal-arrow\ndata\n  title 釋出流程\n  lists")).toBe("釋出流程");
    expect(infographicNoteTitleIsAutomatic({
      noteTitle: "DIKW 知識層級金字塔",
      graphicTitle: "騰訊與位元組跳動對比",
      defaultTitle: "資訊圖",
      earlierTitles: ["DIKW 知識層級金字塔"],
    })).toBe(true);
    expect(nextInfographicNoteTitle({
      noteTitle: "騰訊與位元組跳動對比",
      previousGraphicTitle: "騰訊與位元組跳動對比",
      nextGraphicTitle: "  ",
      defaultTitle: "資訊圖",
    })).toBe("騰訊與位元組跳動對比");
  });
});
