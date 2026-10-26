import { expect, test } from "bun:test";
import { PosterDocumentSchema, createPosterDocument, parsePosterDocument, serializePosterDocument } from "@edgeever/shared";
import { compilePosterMemo } from "../../../api/src/mcp-poster-tools";
import { composePosterTemplate, hasPosterSections, posterTemplateHeaderHeight } from "./poster-template-content";

const sections = Array.from({ length: 6 }, (_, i) => ({ heading: `業務 ${i + 1}`, body: `保留業務說明 ${i + 1}` }));
const source = () => compilePosterMemo({ notebookId: "inbox", title: "產業版圖", heading: "產業版圖", subtitle: "連線內容與服務", badge: "產業觀察", footer: "數字生態", sections, template: "bold" }).document;
const cover = (height, background = "#d9e1d3") => PosterDocumentSchema.parse({ ...createPosterDocument("產業版圖", "連線內容與服務", "minimal", 1080, height), background,
  templateId: "sage", copy: { title: "產業版圖", subtitle: "連線內容與服務", badge: "產業觀察" },
  elements: [{ id: "design_0", name: "title", role: "title", type: "text", text: "產業版圖", sourceText: "產業版圖", x: 80, y: 100, width: 900, height: 100, fontSize: 60, fontFamily: "sans-serif", fontWeight: "bold", textAlign: "left", fill: "#26302a", rotation: 0, opacity: 1 }] });

test("template changes remove generated cover layers and keep body below the new title", () => {
  const original = source();
  original.elements.push({ id: "user-shape", name: "User shape", type: "ellipse", x: 10, y: 10, width: 20, height: 20, fill: "#ff0000", rotation: 0, opacity: 1 });
  const headerHeight = posterTemplateHeaderHeight(original, original.height);
  const next = composePosterTemplate(original, cover(headerHeight), original.width, original.height, headerHeight);
  expect(next.elements.some(element => ["content-header", "heading", "subtitle", "badge", "accent"].includes(element.id))).toBe(false);
  expect(next.elements.find(element => element.id === "user-shape")).toEqual(original.elements.find(element => element.id === "user-shape"));
  const title = next.elements.find(element => element.role === "title");
  for (const card of next.elements.filter(element => /^section-\d+-card$/.test(element.id))) expect(card.y).toBeGreaterThan(title.y + title.height);
  for (let i = 1; i <= 6; i++) expect(next.elements.find(element => element.id === `section-${i}-body`).text).toBe(`保留業務說明 ${i}`);
  expect(next.elements.find(element => element.id === "footer").text).toBe("數字生態");
  expect(parsePosterDocument(serializePosterDocument(next))).toEqual(next);
  const again = composePosterTemplate(next, cover(headerHeight, "#ffffff"), next.width, next.height, headerHeight);
  expect(again.elements).toHaveLength(next.elements.length);
  expect(again.elements.find(element => element.id === "section-1-card").y).toBe(next.elements.find(element => element.id === "section-1-card").y);
});

test("headline-only posters preserve custom objects without introducing a body region", () => {
  const original = createPosterDocument("產業版圖");
  const custom = { id: "custom", name: "Custom", type: "rect", x: 50, y: 50, width: 100, height: 100, fill: "#16a06e", rotation: 0, opacity: 1 };
  original.elements.push(custom);
  expect(posterTemplateHeaderHeight(original, original.height)).toBe(original.height);
  const next = composePosterTemplate(original, cover(original.height), original.width, original.height, original.height);
  expect(next.elements.map(element => element.id)).toEqual(["design_0", "custom"]);
});

test("short canvases scale the template header and clear stale previews", () => {
  const original = source();
  original.previewResourceId = "stale";
  const next = composePosterTemplate(original, cover(320), 1080, 600, 216);
  expect(next.height).toBe(600);
  expect(next.previewResourceId).toBeUndefined();
  expect(next.elements.find(element => element.id === "design_0").y).toBe(67.5);
  expect(next.elements.find(element => element.id === "section-1-card").y).toBeGreaterThan(216);
});

test("legacy card-1-bg and badge-text formats compose cleanly without ghost badges or overlaps", () => {
  const legacy = PosterDocumentSchema.parse({
    schemaVersion: 1,
    width: 1080,
    height: 1440,
    background: "#f4efe4",
    templateId: "editorial",
    copy: { badge: "EDGEEVER", title: "大標題", subtitle: "副標題" },
    elements: [
      { id: "accent-bar", name: "accent-bar", type: "rect", x: 96, y: 110, width: 120, height: 12, fill: "#16a06e", rotation: 0, opacity: 1 },
      { id: "badge-text", name: "badge-text", type: "text", role: "badge", text: "EDGEEVER", x: 96, y: 150, width: 888, height: 40, rotation: 0, opacity: 1, fill: "#0f766e", fontSize: 24, fontFamily: "sans-serif", fontWeight: "bold", textAlign: "left" },
      { id: "heading", name: "heading", type: "text", role: "title", text: "大標題", x: 96, y: 220, width: 888, height: 220, rotation: 0, opacity: 1, fill: "#07130b", fontSize: 84, fontFamily: "serif", fontWeight: "bold", textAlign: "left" },
      { id: "subtitle", name: "subtitle", type: "text", role: "subtitle", text: "副標題", x: 96, y: 470, width: 888, height: 80, rotation: 0, opacity: 1, fill: "#3f3f46", fontSize: 32, fontFamily: "sans-serif", fontWeight: "normal", textAlign: "left" },
      { id: "card-1-bg", name: "card-1-bg", type: "rect", x: 96, y: 590, width: 888, height: 220, fill: "#ffffff", rotation: 0, opacity: 1 },
      { id: "card-1-title", name: "card-1-title", type: "text", text: "01 · 卡片一", x: 136, y: 630, width: 808, height: 48, rotation: 0, opacity: 1, fill: "#07130b", fontSize: 32, fontFamily: "sans-serif", fontWeight: "bold", textAlign: "left" },
      { id: "card-1-body", name: "card-1-body", type: "text", text: "卡片正文說明", x: 136, y: 695, width: 808, height: 70, rotation: 0, opacity: 1, fill: "#71717a", fontSize: 24, fontFamily: "sans-serif", fontWeight: "normal", textAlign: "left" },
    ],
  });

  expect(hasPosterSections(legacy)).toBe(true);
  const headerHeight = posterTemplateHeaderHeight(legacy, 1440);
  const next = composePosterTemplate(legacy, cover(headerHeight), 1080, 1440, headerHeight);

  expect(next.elements.some(element => ["accent-bar", "badge-text", "heading", "subtitle"].includes(element.id))).toBe(false);
  const card = next.elements.find(element => element.id === "card-1-bg");
  expect(card).toBeDefined();
  const title = next.elements.find(element => element.role === "title");
  expect(card.y).toBeGreaterThan(title.y + title.height);
});
