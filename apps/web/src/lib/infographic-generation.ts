import {
  buildOfficialInfographicSyntax,
  infographicRequestsTimeline,
  officialTemplateFamily,
  parseGeneratedOfficialData,
  type OfficialTemplateFamily,
} from "@edgeever/shared";

export { buildOfficialInfographicSyntax, officialTemplateFamily, parseGeneratedOfficialData };
export type { OfficialTemplateFamily };

export const INFOGRAPHIC_TEMPLATES = [
  { id: "list-row-simple-horizontal-arrow", label: "simpleList", kind: "steps", hint: "short horizontal process" },
  { id: "sequence-steps-simple", label: "numberedSteps", kind: "steps", hint: "numbered steps" },
  { id: "sequence-horizontal-zigzag-simple", label: "zigzagSteps", kind: "steps", hint: "longer alternating process" },
  { id: "list-column-done-list", label: "verticalList", kind: "list", hint: "checklist" },
  { id: "list-grid-simple", label: "gridList", kind: "list", hint: "parallel ideas in a grid" },
  { id: "list-pyramid-compact-card", label: "pyramidList", kind: "list", hint: "ranked levels or priorities" },
  { id: "sequence-timeline-simple", label: "timeline", kind: "timeline", hint: "simple chronological events" },
  { id: "sequence-timeline-done-list", label: "timelineChecklist", kind: "timeline", hint: "chronological milestones" },
  { id: "sequence-roadmap-vertical-simple", label: "roadmap", kind: "timeline", hint: "vertical roadmap" },
  { id: "compare-binary-horizontal-badge-card-vs", label: "comparison", kind: "comparison", hint: "two subjects with matched aspects and VS divider" },
  { id: "compare-binary-horizontal-compact-card-vs", label: "compactComparison", kind: "comparison", hint: "dense two-sided comparison with VS divider" },
  { id: "compare-binary-horizontal-simple-arrow", label: "arrowComparison", kind: "comparison", hint: "before and after or directional comparison" },
  { id: "compare-quadrant-quarter-simple-card", label: "quadrant", kind: "quadrant", hint: "four labeled quadrants" },
  { id: "compare-quadrant-quarter-circular", label: "circularQuadrant", kind: "quadrant", hint: "four quadrants in a circular style" },
  { id: "quadrant-quarter-simple-card", label: "quadrant", kind: "quadrant", hint: "legacy four quadrants", selectable: false },
] as const;

export type InfographicKind = (typeof INFOGRAPHIC_TEMPLATES)[number]["kind"];
export type InfographicItem = { label: string; description?: string; children?: InfographicItem[] };
export type InfographicContent = {
  kind: InfographicKind;
  template: string;
  title: string;
  description?: string;
  items: InfographicItem[];
};

export const selectableInfographicTemplates = INFOGRAPHIC_TEMPLATES.filter((item) => !("selectable" in item && item.selectable === false));

export const infographicTemplatePrompt = () => selectableInfographicTemplates
  .map((item) => `${item.id} (${item.kind}: ${item.hint})`).join("; ");

export const INFOGRAPHIC_FAMILIES: OfficialTemplateFamily[] = ["chart", "comparison", "hierarchy", "list", "quadrant", "relation", "sequence"];

export type InfographicFamilyDecision = {
  family: OfficialTemplateFamily;
  confidence: number;
  alternatives: OfficialTemplateFamily[];
  ambiguous: boolean;
};

export type InfographicEditDecision = InfographicFamilyDecision & { intent: "keep" | "layout" | "change" };

export const parseInfographicEditDecision = (output: string): InfographicEditDecision | null => {
  const family = parseInfographicFamilyDecision(output, false);
  if (!family) return null;
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  try {
    const value: unknown = JSON.parse(output.slice(first, last + 1));
    if (!isRecord(value) || !["keep", "layout", "change"].includes(String(value.intent))) return null;
    return { ...family, intent: value.intent as InfographicEditDecision["intent"] };
  } catch { return null; }
};

export const parseInfographicFamilyDecision = (output: string, requireAlternatives = true): InfographicFamilyDecision | null => {
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  if (first < 0 || last <= first) return null;
  try {
    const value: unknown = JSON.parse(output.slice(first, last + 1));
    if (!isRecord(value) || !INFOGRAPHIC_FAMILIES.includes(value.family as OfficialTemplateFamily)
      || typeof value.confidence !== "number" || !Number.isFinite(value.confidence)
      || value.confidence < 0 || value.confidence > 1 || typeof value.ambiguous !== "boolean"
      || !Array.isArray(value.alternatives)) return null;
    const alternatives = value.alternatives.filter((family): family is OfficialTemplateFamily =>
      INFOGRAPHIC_FAMILIES.includes(family as OfficialTemplateFamily) && family !== value.family);
    if (requireAlternatives && (value.ambiguous || value.confidence < 0.65) && alternatives.length === 0) return null;
    return { family: value.family as OfficialTemplateFamily, confidence: value.confidence,
      alternatives: [...new Set(alternatives)].slice(0, 2), ambiguous: value.ambiguous };
  } catch { return null; }
};

export const infographicFamilyChoices = (decision: InfographicFamilyDecision) =>
  decision.ambiguous || decision.confidence < 0.65
    ? [decision.family, ...decision.alternatives].slice(0, 3) : [];

export const templateForRequest = (request: string): string | null => {
  if (/(餅圖|環形圖|pie|donut)/i.test(request)) return "chart-pie-donut-plain-text";
  if (/(柱狀圖|條形圖|bar chart|column chart)/i.test(request)) return "chart-column-simple";
  if (/(折線圖|趨勢圖|line chart)/i.test(request)) return "chart-line-plain-text";
  if (/(詞雲|word\s*cloud)/i.test(request)) return "chart-wordcloud";
  if (/(思維導圖|腦圖|mind\s*map)/i.test(request)) return "hierarchy-mindmap-branch-gradient-lined-palette";
  if (/(層級圖|組織結構|樹狀圖|hierarchy|org chart)/i.test(request)) return "hierarchy-tree-tech-style-capsule-item";
  if (/(關係圖|網路圖|relation|network)/i.test(request)) return "relation-network-simple-circle-node";
  return null;
};

export const sampleOfficialData = (template: string): Record<string, unknown> => {
  const family = officialTemplateFamily(template);
  const entry = (label: string, desc: string) => ({ label, desc });
  if (family === "chart") return { title: "示例圖表", values: [{ label: "專案 A", value: 40 }, { label: "專案 B", value: 30 }, { label: "專案 C", value: 20 }] };
  if (family === "hierarchy") return { title: "示例層級", root: { label: "主題", children: [entry("分支 A", "說明"), entry("分支 B", "說明")] } };
  if (family === "relation") return { title: "示例關係", nodes: [{ id: "a", label: "節點 A" }, { id: "b", label: "節點 B" }], relations: [{ from: "a", to: "b", direction: "forward" }] };
  if (family === "comparison") {
    const labels = template === "compare-swot" ? ["優勢", "劣勢", "機會", "威脅"] : ["方案 A", "方案 B"];
    return { title: "示例對比", compares: labels.map((label) => ({ label, children: [entry("維度一", "簡短說明"), entry("維度二", "簡短說明")] })) };
  }
  if (family === "quadrant") return { title: "示例四象限", compares: ["第一象限", "第二象限", "第三象限", "第四象限"].map((label) => entry(label, "簡短說明")) };
  if (family === "sequence") return { title: "示例流程", sequences: [entry("第一步", "簡短說明"), entry("第二步", "簡短說明"), entry("第三步", "簡短說明")] };
  return { title: "示例列表", lists: [entry("專案 A", "簡短說明"), entry("專案 B", "簡短說明"), entry("專案 C", "簡短說明")] };
};

export const parseGeneratedOfficialSelection = (output: string, templates: string[]) => {
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  if (first < 0 || last <= first) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(output.slice(first, last + 1)); } catch { return null; }
  if (!isRecord(parsed) || typeof parsed.template !== "string" || !templates.includes(parsed.template)) return null;
  const data = parseGeneratedOfficialData(output, parsed.template);
  return data ? { template: parsed.template, data } : null;
};

export const shortlistOfficialTemplates = (request: string, templates: string[], currentTemplate?: string, family?: OfficialTemplateFamily) => {
  const requestedFamily: OfficialTemplateFamily = family ?? (templateForRequest(request)?.startsWith("chart-") ? "chart"
    : /(思維導圖|腦圖|樹狀圖|組織結構|層級|mind\s*map|hierarchy|org chart)/i.test(request) ? "hierarchy"
    : /(關係圖|網路圖|network|relation)/i.test(request) ? "relation"
    : /(四象限|象限|quadrant)/i.test(request) ? "quadrant"
    : /(對比|比較|差異|swot|\bvs\b|comparison)/i.test(request) ? "comparison"
    : /(步驟|流程|時間線|時間軸|發展歷程|發展史|歷史沿革|成長曆程|路線圖|里程碑|step|process|timeline|roadmap)/i.test(request) ? "sequence"
    : /(餅圖|柱狀圖|折線圖|圖表|chart|graph)/i.test(request) ? "chart"
    : currentTemplate ? officialTemplateFamily(currentTemplate) : "list");
  const words = request.toLowerCase().match(/[a-z]+/g) ?? [];
  const preferred = new Set([templateForRequest(request), ...(!requestsInfographicLayoutChange(request) ? [currentTemplate] : [])].filter(Boolean));
  const candidates = templates.filter((id) => officialTemplateFamily(id) === requestedFamily);
  const comparisonCandidates = requestedFamily === "comparison"
    ? /(swot|優劣勢)/i.test(request) ? candidates.filter((id) => id === "compare-swot")
      : /(優缺點|利弊|pros|cons)/i.test(request) ? candidates.filter((id) => id.includes("pros-cons"))
      : /(前後|變化|before|after|箭頭)/i.test(request) ? candidates.filter((id) => id.includes("arrow"))
      : candidates.filter((id) => id.endsWith("-vs"))
    : candidates;
  const familyCandidates = comparisonCandidates.length ? comparisonCandidates : candidates;
  const shapedCandidates = requestedFamily === "sequence" && /(時間線|時間軸|發展歷程|發展史|歷史沿革|成長曆程|里程碑|timeline|chronolog)/i.test(request)
    ? familyCandidates.filter((id) => id.startsWith("sequence-timeline-"))
    : requestedFamily === "sequence" && /(路線圖|roadmap)/i.test(request)
      ? familyCandidates.filter((id) => id.startsWith("sequence-roadmap-"))
      : familyCandidates;
  const alternatives = requestsInfographicLayoutChange(request)
    ? shapedCandidates.filter((id) => id !== currentTemplate) : shapedCandidates;
  return (alternatives.length ? alternatives : shapedCandidates)
    .map((id, index) => ({ id, score: (preferred.has(id) ? 100 : 0) + words.filter((word) => word.length > 2 && id.includes(word)).length * 8 - index * 0.01 }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map(({ id }) => id);
};

export const infographicAgentCandidates = (request: string, templates: string[], currentTemplate?: string) =>
  [...new Set([
    ...(infographicRequestsTimeline(request) ? shortlistOfficialTemplates(request, templates, currentTemplate, "sequence").slice(0, 6) : []),
    ...(currentTemplate && templates.includes(currentTemplate) ? [currentTemplate] : []),
    ...INFOGRAPHIC_FAMILIES.flatMap((family) => shortlistOfficialTemplates(request, templates, currentTemplate, family).slice(0, 6)),
  ])].slice(0, 50);

const plainLine = (value: string) => value.replace(/\s+/g, " ").trim();

export const infographicSyntaxTitle = (syntax: string) => {
  const line = syntax.split("\n").find((entry) => /^  title \S/.test(entry));
  return line ? plainLine(line.slice(8)) : "";
};

export const infographicNoteTitleIsAutomatic = (input: {
  noteTitle: string;
  graphicTitle: string;
  defaultTitle: string;
  earlierTitles?: string[];
}) => {
  const note = plainLine(input.noteTitle);
  if (!note) return true;
  return [input.defaultTitle, input.graphicTitle, ...(input.earlierTitles ?? [])].some((title) => plainLine(title) === note);
};

// The note title follows the infographic title the conversation just applied.
// A title typed into the note field stays only while that graphic title itself stays put.
export const nextInfographicNoteTitle = (input: {
  noteTitle: string;
  previousGraphicTitle: string;
  nextGraphicTitle: string;
  defaultTitle: string;
  keepCustomTitle?: boolean;
}) => {
  const note = plainLine(input.noteTitle);
  const previous = plainLine(input.previousGraphicTitle);
  const next = plainLine(input.nextGraphicTitle).slice(0, 160);
  const fallback = plainLine(input.defaultTitle);
  if (!next || next === note) return note;
  if (!note || note === fallback || note === previous || !input.keepCustomTitle) return next;
  if (previous && next !== previous) return next;
  return note;
};

export const buildInfographicSyntax = (input: {
  template: string;
  title: string;
  description?: string;
  items: InfographicItem[];
  dark?: boolean;
}) => {
  const lines = [`infographic ${input.template}`];
  if (input.dark) lines.push("theme dark");
  lines.push("data");
  if (input.title.trim()) lines.push(`  title ${plainLine(input.title)}`);
  if (input.description?.trim()) lines.push(`  desc ${plainLine(input.description)}`);
  if (input.items.length) {
    const comparison = input.template.startsWith("compare-binary-");
    lines.push(input.template.startsWith("sequence-") ? "  sequences" : comparison || /^(compare-)?quadrant-/.test(input.template) ? "  compares" : "  lists");
    for (const item of input.items) {
      lines.push(`    - label ${plainLine(item.label)}`);
      if (comparison) {
        lines.push("      children", `        - label ${plainLine(item.label)}`);
        if (item.description?.trim()) lines.push(`          desc ${plainLine(item.description)}`);
        for (const child of item.children ?? []) {
          lines.push(`        - label ${plainLine(child.label)}`);
          if (child.description?.trim()) lines.push(`          desc ${plainLine(child.description)}`);
        }
      } else if (item.description?.trim()) lines.push(`      desc ${plainLine(item.description)}`);
    }
  }
  return lines.join("\n");
};

export const inferInfographicKind = (request: string): InfographicKind | null => {
  if (/(四象限|象限|swot|quadrant|2\s*[×xX]\s*2)/i.test(request)) return "quadrant";
  if (/(對比|比較|差異|\bvs\.?\b|\bversus\b|compar(?:e|ison))/i.test(request)) return "comparison";
  if (/(時間線|時間軸|發展歷程|發展史|歷史沿革|成長曆程|路線圖|里程碑|timeline|chronolog|roadmap)/i.test(request)) return "timeline";
  if (/(步驟|流程|step|process)/i.test(request)) return "steps";
  if (/(清單|列表|金字塔|網格|list|pyramid|grid)/i.test(request)) return "list";
  return null;
};

export const inferInfographicFamily = (request: string): OfficialTemplateFamily | null => {
  const namedTemplate = templateForRequest(request);
  if (namedTemplate) return officialTemplateFamily(namedTemplate);
  const kind = inferInfographicKind(request);
  if (kind === "steps" || kind === "timeline") return "sequence";
  if (kind) return kind;
  if (/(資料視覺化|圖表|\bchart\b)/i.test(request)) return "chart";
  return null;
};

export const requestsInfographicLayoutChange = (request: string) =>
  /(模板|版式|風格|樣式|佈局|排版|緊湊|圓形|金字塔|網格|路線圖|里程碑|編號|交錯|template|layout|style|compact|circular|pyramid|grid|roadmap|milestone|numbered|zigzag)/i.test(request)
  || /(換個|另一種|其他|更合適).{0,8}(圖|模板|版式)/i.test(request);

export const requestsInfographicFamilyChange = (request: string) =>
  /(圖形型別|圖表型別|換個圖|另一種圖|其他圖|更合適的圖|different (?:chart|diagram|type))/i.test(request);

const inferInfographicTemplate = (request: string, kind: InfographicKind): string | null => {
  if (kind === "quadrant" && /(圓形|圓環|circular)/i.test(request)) return "compare-quadrant-quarter-circular";
  if (kind === "comparison" && /(緊湊|密集|compact)/i.test(request)) return "compare-binary-horizontal-compact-card-vs";
  if (kind === "comparison" && /(前後|變化|方向|箭頭|arrow)/i.test(request)) return "compare-binary-horizontal-simple-arrow";
  if (kind === "timeline" && /(路線圖|roadmap)/i.test(request)) return "sequence-roadmap-vertical-simple";
  if (kind === "timeline" && /(里程碑|milestone)/i.test(request)) return "sequence-timeline-done-list";
  if (kind === "list" && /(金字塔|pyramid)/i.test(request)) return "list-pyramid-compact-card";
  if (kind === "list" && /(網格|grid)/i.test(request)) return "list-grid-simple";
  if (kind === "steps" && /(交錯|zigzag)/i.test(request)) return "sequence-horizontal-zigzag-simple";
  if (kind === "steps" && /(編號|數字|numbered)/i.test(request)) return "sequence-steps-simple";
  return null;
};

export const resolveInfographicTemplateSelection = (request: string, templates: string[], currentTemplate?: string, family?: OfficialTemplateFamily) => {
  if (family) return { template: null, candidates: shortlistOfficialTemplates(request, templates, currentTemplate, family) };
  const namedTemplate = templates.find((id) => request.includes(id));
  const requestedKind = inferInfographicKind(request);
  const inferredTemplate = templateForRequest(request)
    ?? (requestsInfographicLayoutChange(request) && requestedKind ? inferInfographicTemplate(request, requestedKind) : null);
  const explicitTemplate = namedTemplate ?? (inferredTemplate && templates.includes(inferredTemplate) ? inferredTemplate : null);
  if (explicitTemplate) return { template: explicitTemplate, candidates: [] as string[] };
  const requestedFamily = requestedKind === "steps" || requestedKind === "timeline" ? "sequence" : requestedKind;
  if (currentTemplate && templates.includes(currentTemplate) && !requestsInfographicLayoutChange(request)
    && (!requestedFamily || officialTemplateFamily(currentTemplate) === requestedFamily)) {
    return { template: currentTemplate, candidates: [] as string[] };
  }
  return { template: null, candidates: shortlistOfficialTemplates(request, templates, currentTemplate) };
};

export const resolveInfographicEditSelection = (request: string, templates: string[], currentTemplate: string, decision: InfographicEditDecision) => {
  if (decision.intent === "keep") return { template: currentTemplate, candidates: [] as string[] };
  const family = decision.intent === "layout" ? officialTemplateFamily(currentTemplate) : decision.family;
  if (decision.intent === "layout") {
    const requested = resolveInfographicTemplateSelection(request, templates, currentTemplate);
    if (requested.template && requested.template !== currentTemplate && officialTemplateFamily(requested.template) === family) return requested;
  }
  const selection = resolveInfographicTemplateSelection(request, templates, currentTemplate, family);
  if (decision.intent !== "layout") return selection;
  const alternatives = selection.candidates.filter((id) => id !== currentTemplate);
  return { template: selection.template, candidates: alternatives.length ? alternatives : selection.candidates };
};

export const shouldReplaceExistingInfographic = (request: string, currentKind: InfographicKind | undefined) => {
  if (!currentKind) return /(生成|畫|做|重做|重新|全新).{0,40}(圖|資訊圖|對比|比較|時間線|流程)/i.test(request);
  const requestedKind = inferInfographicKind(request);
  if (requestedKind && requestedKind !== currentKind) return true;
  if (/(模板|版式|風格|樣式|佈局|緊湊|圓形|template|layout|style)/i.test(request) && !/(生成|畫|做|重做|重新)/i.test(request)) return false;
  return /(生成|畫|做|換成|改成|重做|重新).{0,40}(圖|資訊圖|對比|比較|時間線|流程)/i.test(request);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const stringValue = (value: unknown) => typeof value === "string" ? plainLine(value).slice(0, 160) : "";
const briefValue = (value: unknown, length: number) => Array.from(stringValue(value)).slice(0, length).join("");

export const parseGeneratedInfographicContent = (output: string, request: string): InfographicContent | null => {
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  if (first < 0 || last <= first) return null;
  let root: unknown;
  try { root = JSON.parse(output.slice(first, last + 1)); } catch { return null; }
  if (!isRecord(root)) return null;
  const data = isRecord(root.data) ? root.data : root;
  const rawKind = stringValue(data.kind ?? data.type).toLowerCase();
  const kind = inferInfographicKind(request)
    ?? (INFOGRAPHIC_TEMPLATES.find((item) => item.kind === rawKind)?.kind ?? "steps");
  const requestedTemplate = stringValue(data.template);
  const template = inferInfographicTemplate(request, kind)
    ?? selectableInfographicTemplates.find((item) => item.id === requestedTemplate && item.kind === kind)?.id
    ?? selectableInfographicTemplates.find((item) => item.kind === kind)!.id;
  const rawItems = data.items ?? data.quadrants ?? data.compares ?? data.steps ?? data.lists ?? data.sequences;
  if (!Array.isArray(rawItems)) return null;
  const items = rawItems.slice(0, kind === "quadrant" ? 4 : kind === "comparison" ? 2 : 12).map((value): InfographicItem | null => {
    if (typeof value === "string") return { label: stringValue(value) };
    if (!isRecord(value)) return null;
    const label = kind === "comparison" ? briefValue(value.label ?? value.title ?? value.name, 16) : stringValue(value.label ?? value.title ?? value.name);
    const description = kind === "comparison" ? briefValue(value.description ?? value.desc ?? value.detail, 24) : stringValue(value.description ?? value.desc ?? value.detail);
    const children = kind === "comparison" && Array.isArray(value.children)
      ? value.children.slice(0, 3).map((child): InfographicItem | null => {
        if (!isRecord(child)) return null;
        const childLabel = briefValue(child.label ?? child.title ?? child.name, 12);
        const childDescription = briefValue(child.description ?? child.desc ?? child.detail, 24);
        return childLabel ? { label: childLabel, ...(childDescription ? { description: childDescription } : {}) } : null;
      }).filter((child): child is InfographicItem => Boolean(child))
      : [];
    return label ? { label, ...(description ? { description } : {}), ...(children.length ? { children } : {}) } : null;
  }).filter((value): value is InfographicItem => Boolean(value?.label));
  if (!items.length || (kind === "quadrant" && items.length !== 4) || (kind === "comparison" && items.length !== 2)) return null;
  return {
    kind,
    template,
    title: stringValue(data.title) || (kind === "quadrant" ? "四象限圖" : stringValue(request).slice(0, 60)),
    description: stringValue(data.description ?? data.desc),
    items,
  };
};

export const generatedInfographicSyntax = (content: InfographicContent) =>
  buildInfographicSyntax({
    template: content.template,
    title: content.title,
    description: content.description,
    items: content.items,
  });
