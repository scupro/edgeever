import { resolveSupportedLocale, type SupportedLocale } from "./i18n/locales";

export type DefaultNotebookSeed = {
  key: "inbox" | "projects" | "learning" | "creative" | "personal";
  slug: string;
  color: string;
  sortOrder: number;
  names: Record<SupportedLocale, string>;
};

// zh-TW is the language the installation migrations seed. Keep it first so
// the localization guard can recognise names that nobody has changed yet.
export const DEFAULT_NOTEBOOK_SEEDS: readonly DefaultNotebookSeed[] = [
  {
    key: "inbox",
    slug: "inbox",
    color: "#0f766e",
    sortOrder: 10,
    names: { "zh-TW": "等待分類", "en-US": "Inbox", ja: "受信トレイ", pl: "Skrzynka" },
  },
  {
    key: "projects",
    slug: "work-projects",
    color: "#2563eb",
    sortOrder: 20,
    names: { "zh-TW": "工作專案", "en-US": "Work Projects", ja: "仕事のプロジェクト", pl: "Projekty zawodowe" },
  },
  {
    key: "learning",
    slug: "learning-resources",
    color: "#7c3aed",
    sortOrder: 30,
    names: { "zh-TW": "學習資料", "en-US": "Learning Resources", ja: "學習資料", pl: "Materiały do nauki" },
  },
  {
    key: "creative",
    slug: "creative-ideas",
    color: "#db2777",
    sortOrder: 40,
    names: { "zh-TW": "靈感創作", "en-US": "Creative Ideas", ja: "アイデアと創作", pl: "Pomysły i twórczość" },
  },
  {
    key: "personal",
    slug: "personal-life",
    color: "#ea580c",
    sortOrder: 50,
    names: { "zh-TW": "生活個人", "en-US": "Personal Life", ja: "暮らしと個人", pl: "Życie prywatne" },
  },
];

export const localizeDefaultNotebookName = (
  seed: DefaultNotebookSeed,
  locale: string | null | undefined,
) => seed.names[resolveSupportedLocale(locale)];

export const WELCOME_MEMO_ID = "memo_welcome";

/**
 * The welcome note as the installation migrations leave it (0001_initial.sql,
 * repaired by 0014_repair_seed_memo_content_hash.sql): its title, the content
 * hash, and revision 0 written by the `system` actor. Any edit, including a
 * title-only one, changes the title, the revision, or the actor, so together
 * they identify a welcome note nobody has touched.
 */
export const WELCOME_MEMO_SEED_TITLE = "歡迎來到 EdgeEver";
export const WELCOME_MEMO_SEED_CONTENT_HASH = "b456f3d15f168a4e3456f3a5f157ad54a84688e7176d2ee5f277bb305871f2be";
// Migration 0071 repairs the original seed's literal backslash-n and advances it to revision 1.
export const WELCOME_MEMO_REPAIRED_CONTENT_HASH = "17d3490cd74684b79199e30a918e23231d29d8363736148987b34179e97c16fe";

export type WelcomeMemoTranslation = {
  title: string;
  paragraphs: [string, string];
};

export const WELCOME_MEMO_TRANSLATIONS: Record<SupportedLocale, WelcomeMemoTranslation> = {
  "zh-TW": {
    title: "歡迎來到 EdgeEver",
    paragraphs: [
      "這是第一條 EdgeEver 筆記，三欄、邊緣、Agent-ready。",
      "接下來可以建立筆記本、寫筆記、搜尋內容，並把多條筆記合併成一條新的長期筆記。",
    ],
  },
  "en-US": {
    title: "Welcome to EdgeEver",
    paragraphs: [
      "This is your first EdgeEver note: three panes, running on the edge, ready for AI agents.",
      "Next, create notebooks, write notes, search your content, and merge several notes into a new long-term note.",
    ],
  },
  ja: {
    title: "EdgeEver へようこそ",
    paragraphs: [
      "これは EdgeEver の最初のノートです。3 ペイン構成でエッジ上で動作し、AI エージェントとも連携できます。",
      "ノートブックを作成してノートを書き、内容を検索し、複数のノートを 1 つの新しい長期ノートにまとめてみましょう。",
    ],
  },
  pl: {
    title: "Witaj w EdgeEver",
    paragraphs: [
      "To Twoja pierwsza notatka w EdgeEver: trzy panele, działanie na brzegu sieci i gotowość do pracy z agentami AI.",
      "Teraz możesz tworzyć notatniki, pisać notatki, przeszukiwać treści i scalać kilka notatek w jedną nową, trwałą notatkę.",
    ],
  },
};

export type WelcomeMemoContent = {
  title: string;
  excerpt: string;
  contentJson: string;
  contentMarkdown: string;
  contentText: string;
};

// Mirrors the document shape of the welcome note in migrations/0001_initial.sql:
// a level-2 heading followed by two paragraphs.
export const buildWelcomeMemoContent = (locale: string | null | undefined): WelcomeMemoContent => {
  const { title, paragraphs } = WELCOME_MEMO_TRANSLATIONS[resolveSupportedLocale(locale)];
  const text = (value: string) => [{ type: "text", text: value }];
  return {
    title,
    excerpt: paragraphs[0],
    contentJson: JSON.stringify({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: text(title) },
        ...paragraphs.map((paragraph) => ({ type: "paragraph", content: text(paragraph) })),
      ],
    }),
    contentMarkdown: [`## ${title}`, ...paragraphs].join("\n\n"),
    contentText: [title, ...paragraphs].join(" "),
  };
};
