import { describe, expect, test } from "bun:test";
import { compileInfographicNote, infographicSyntaxTemplate, parseInfographicDocument, serializeInfographicDocument } from "./index.ts";

describe("infographic note syntax", () => {
  test("compiles a revenue share into a pie infographic", () => {
    const compiled = compileInfographicNote("chart-pie-donut-plain-text", {
      title: "騰訊 2025 年營收佔比",
      desc: "圖中比例為演示用估算，不代表騰訊官方披露資料。",
      values: [
        { label: "增值服務", value: 52 },
        { label: "金融科技與企業服務", value: 30 },
        { label: "網路廣告", value: 16 },
        { label: "其他業務", value: 2 },
      ],
    });
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) return;
    expect(compiled.title).toBe("騰訊 2025 年營收佔比");
    expect(compiled.syntax).toBe(`infographic chart-pie-donut-plain-text
data
  title 騰訊 2025 年營收佔比
  desc 圖中比例為演示用估算，不代表騰訊官方披露資料。
  values
    - label 增值服務
      value 52
    - label 金融科技與企業服務
      value 30
    - label 網路廣告
      value 16
    - label 其他業務
      value 2`);
    expect(infographicSyntaxTemplate(compiled.syntax)).toBe("chart-pie-donut-plain-text");
    expect(parseInfographicDocument(serializeInfographicDocument({ schemaVersion: 1, syntax: compiled.syntax }))?.syntax).toBe(compiled.syntax);
  });

  test("rejects a share chart whose parts are not positive numbers", () => {
    expect(compileInfographicNote("chart-pie-donut-plain-text", {
      title: "佔比",
      values: [{ label: "甲", value: -1 }, { label: "乙", value: 2 }],
    })).toMatchObject({ ok: false });
    expect(compileInfographicNote("chart-column-simple", {
      title: "趨勢",
      values: [{ label: "甲" }],
    })).toMatchObject({ ok: false });
    expect(compileInfographicNote("not-a-template", { title: "佔比", values: [{ label: "甲", value: 1 }] })).toMatchObject({ ok: false });
  });
});
