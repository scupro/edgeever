import { describe, expect, test } from "bun:test";
import {
  createSlashCommandItems,
  filterSlashCommandItems,
  formatCurrentDate,
  formatCurrentDateTime,
  formatCurrentTime,
} from "./SlashCommandMenu.tsx";

const labels = {
  menu: "插入功能選單",
  empty: "沒有匹配的功能。",
  close: "關閉選單",
  groups: { suggested: "建議", basic: "基本區塊", insert: "插入" },
  items: {
    ai: "用 AI 處理",
    paragraph: "正文",
    "heading-1": "標題 1",
    "heading-2": "標題 2",
    "heading-3": "標題 3",
    "heading-4": "標題 4",
    "heading-5": "標題 5",
    "heading-6": "標題 6",
    "bullet-list": "無序列表",
    "ordered-list": "有序列表",
    "task-list": "任務清單",
    blockquote: "引用",
    "code-block": "程式碼塊",
    divider: "分割線",
    fold: "摺疊塊",
    table: "表格",
    "inline-math": "插入公式",
    "block-math": "塊級公式",
    "current-date": "當前日期",
    "current-time": "當前時間",
    "current-date-time": "當前日期和時間",
    attachment: "上傳附件",
    "note-link": "引用筆記",
    "external-link": "插入超連結",
  },
};

describe("slash command menu", () => {
  const items = createSlashCommandItems(labels);

  test("shows all commands for a bare slash", () => {
    const unfilteredItems = filterSlashCommandItems(items, "");
    const heading6Index = unfilteredItems.findIndex((item) => item.id === "heading-6");

    expect(unfilteredItems).toHaveLength(24);
    expect(unfilteredItems.slice(heading6Index + 1, heading6Index + 4).map((item) => item.id)).toEqual([
      "current-date",
      "current-time",
      "current-date-time",
    ]);
  });

  test("searches localized labels and aliases", () => {
    expect(filterSlashCommandItems(items, "AI").map((item) => item.id)).toEqual(["ai"]);
    expect(filterSlashCommandItems(items, "待辦").map((item) => item.id)).toEqual(["task-list"]);
    expect(filterSlashCommandItems(items, "h2").map((item) => item.id)).toEqual(["heading-2"]);
    expect(filterSlashCommandItems(items, "h5").map((item) => item.id)).toEqual(["heading-5"]);
    expect(filterSlashCommandItems(items, "今天").map((item) => item.id)).toEqual(["current-date"]);
    expect(filterSlashCommandItems(items, "timestamp").map((item) => item.id)).toEqual(["current-date-time"]);
  });

  test("assigns every item a unique lowercase slash command alias", () => {
    expect(items.map((item) => item.command)).toEqual([
      "ai",
      "text",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "date",
      "time",
      "datetime",
      "bullet",
      "numbered",
      "task",
      "quote",
      "code",
      "divider",
      "fold",
      "table",
      "math",
      "equation",
      "upload",
      "note",
      "link",
    ]);
    expect(items.every((item) => /^[a-z][a-z0-9]*$/.test(item.command))).toBe(true);
    expect(new Set(items.map((item) => item.command)).size).toBe(items.length);
    expect(filterSlashCommandItems(items, "摺疊").map((item) => item.id)).toEqual(["fold"]);
    expect(filterSlashCommandItems(items, "collapse").map((item) => item.id)).toEqual(["fold"]);
    expect(filterSlashCommandItems(items, "table").map((item) => item.id)).toEqual(["table"]);
    expect(filterSlashCommandItems(items, "task").map((item) => item.id)).toEqual(["task-list"]);
    expect(filterSlashCommandItems(items, "公式").map((item) => item.id)).toEqual(["inline-math", "block-math"]);
    expect(filterSlashCommandItems(items, "equation").map((item) => item.id)).toEqual(["block-math"]);
  });

  test("formats local date and time as stable static text", () => {
    const date = new Date(2026, 0, 2, 3, 4, 5);

    expect(formatCurrentDate(date)).toBe("2026-01-02");
    expect(formatCurrentTime(date)).toBe("03:04");
    expect(formatCurrentDateTime(date)).toBe("2026-01-02 03:04");
  });
});
