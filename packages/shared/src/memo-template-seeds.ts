import { resolveSupportedLocale } from "./i18n/locales";

export type MemoTemplateSeedLocale = "zh-TW" | "en-US" | "ja" | "pl";

export type MemoTemplateSeedTranslation = {
  title: string;
  description: string;
  contentMarkdown: string;
};

export type MemoTemplateSeed = {
  key: "quick-note" | "meeting" | "weekly-review" | "reading" | "okr";
  translationKey: "quickNote" | "meeting" | "weeklyReview" | "reading" | "okr";
  tag: string;
  translations: Record<MemoTemplateSeedLocale, MemoTemplateSeedTranslation>;
};

const seed = (
  metadata: Omit<MemoTemplateSeed, "translations">,
  zhTW: MemoTemplateSeedTranslation,
  enUS: MemoTemplateSeedTranslation,
  ja: MemoTemplateSeedTranslation,
  pl: MemoTemplateSeedTranslation,
): MemoTemplateSeed => ({
  ...metadata,
  translations: { "zh-TW": zhTW, "en-US": enUS, ja, pl },
});

export const DEFAULT_MEMO_TEMPLATE_SEEDS: readonly MemoTemplateSeed[] = [
  seed(
    { key: "quick-note", translationKey: "quickNote", tag: "quick-note" },
    {
      title: "靈感速記",
      description: "快速捕捉閃念、臨時靈感、資料連結與即刻行動。",
      contentMarkdown: "## 💡 閃念記錄\n\n- \n\n## 📌 背景與補充說明\n\n\n\n## 🚀 下一步動作\n\n- [ ] ",
    },
    {
      title: "Quick Spark",
      description: "Capture fleeting thoughts, ideas, links, and immediate action items.",
      contentMarkdown: "## 💡 Fleeting Thoughts\n\n- \n\n## 📌 Context & Notes\n\n\n\n## 🚀 Next Actions\n\n- [ ] ",
    },
    {
      title: "ひらめきメモ",
      description: "ふとした思いつき、アイデア、リンク、すぐやることをすばやく書き留めます。",
      contentMarkdown: "## 💡 ひらめき\n\n- \n\n## 📌 背景と補足\n\n\n\n## 🚀 次のアクション\n\n- [ ] ",
    },
    {
      title: "Szybka notatka",
      description: "Zapisuj ulotne myśli, pomysły, linki i działania do natychmiastowego podjęcia.",
      contentMarkdown: "## 💡 Ulotne myśli\n\n- \n\n## 📌 Kontekst i uwagi\n\n\n\n## 🚀 Kolejne kroki\n\n- [ ] ",
    },
  ),
  seed(
    { key: "meeting", translationKey: "meeting", tag: "meeting" },
    {
      title: "會議紀要",
      description: "結構化記錄議題背景、核心結論與帶負責人的待辦事項。",
      contentMarkdown: "# 📝 會議紀要\n\n- **時間**：\n- **主持人/記錄人**：\n- **參會人**：\n\n---\n\n## 🎯 會議目標\n\n- \n\n## 💬 核心討論與決策\n\n1. **[議題 1]**\n   - 討論要點：\n   - ✅ **決議**：\n\n2. **[議題 2]**\n   - 討論要點：\n   - ✅ **決議**：\n\n## 📋 待辦事項 (Action Items)\n\n- [ ] **[負責人]** 任務描述 (截止日期：MM-DD)\n- [ ] **[負責人]** 任務描述 (截止日期：MM-DD)\n",
    },
    {
      title: "Meeting Minutes",
      description: "Structured log for agenda, key decisions, and action items with owners.",
      contentMarkdown: "# 📝 Meeting Minutes\n\n- **Time**:\n- **Host/Recorder**:\n- **Attendees**:\n\n---\n\n## 🎯 Goal\n\n- \n\n## 💬 Discussion & Decisions\n\n1. **[Topic 1]**\n   - Points:\n   - ✅ **Decision**:\n\n2. **[Topic 2]**\n   - Points:\n   - ✅ **Decision**:\n\n## 📋 Action Items\n\n- [ ] **[Owner]** Task description (Due: MM-DD)\n- [ ] **[Owner]** Task description (Due: MM-DD)\n",
    },
    {
      title: "会議メモ",
      description: "議題の背景、主な決定、担当者つきのToDoを構造化して記録します。",
      contentMarkdown: "# 📝 会議メモ\n\n- **日時**：\n- **司会/記録**：\n- **参加者**：\n\n---\n\n## 🎯 会議の目的\n\n- \n\n## 💬 議論と決定\n\n1. **[議題 1]**\n   - ポイント：\n   - ✅ **決定**：\n\n2. **[議題 2]**\n   - ポイント：\n   - ✅ **決定**：\n\n## 📋 アクションアイテム\n\n- [ ] **[担当者]** タスク内容（期限：MM-DD）\n- [ ] **[担当者]** タスク内容（期限：MM-DD）\n",
    },
    {
      title: "Notatka ze spotkania",
      description: "Uporządkowany zapis agendy, kluczowych decyzji i zadań z osobami odpowiedzialnymi.",
      contentMarkdown: "# 📝 Notatka ze spotkania\n\n- **Termin**:\n- **Prowadzący/protokolant**:\n- **Uczestnicy**:\n\n---\n\n## 🎯 Cel\n\n- \n\n## 💬 Dyskusja i decyzje\n\n1. **[Temat 1]**\n   - Najważniejsze punkty:\n   - ✅ **Decyzja**:\n\n2. **[Temat 2]**\n   - Najważniejsze punkty:\n   - ✅ **Decyzja**:\n\n## 📋 Zadania do wykonania\n\n- [ ] **[Osoba odpowiedzialna]** Opis zadania (termin: MM-DD)\n- [ ] **[Osoba odpowiedzialna]** Opis zadania (termin: MM-DD)\n",
    },
  ),
  seed(
    { key: "weekly-review", translationKey: "weeklyReview", tag: "weekly-review" },
    {
      title: "週報與進展覆盤",
      description: "梳理本週核心產出、風險卡點與下週關鍵優先順序。",
      contentMarkdown: "# 🗓️ 工作週報\n\n## 🌟 本週核心進展 (Highlights)\n\n- [x] **[專案/功能]** 完成情況與成果說明\n- [x] **[專案/功能]** 完成情況與成果說明\n\n## 🚧 卡點與風險 (Blockers & Risks)\n\n- ⚠️ **阻塞項**：原因及所需支援\n\n## 🎯 下週優先順序 (Next Week Priorities)\n\n- [ ] \n- [ ] \n- [ ] \n\n## 💡 總結與思考\n\n- \n",
    },
    {
      title: "Weekly Review & Status",
      description: "Summarize weekly highlights, blockers, and next week's key priorities.",
      contentMarkdown: "# 🗓️ Weekly Status Report\n\n## 🌟 Highlights\n\n- [x] **[Project/Feature]** Accomplishment details\n- [x] **[Project/Feature]** Accomplishment details\n\n## 🚧 Blockers & Risks\n\n- ⚠️ **Blocker**: Reason and required support\n\n## 🎯 Next Week Priorities\n\n- [ ] \n- [ ] \n- [ ] \n\n## 💡 Reflection & Insights\n\n- \n",
    },
    {
      title: "週次レビュー",
      description: "今週の成果、ブロッカー、来週の優先事項を整理します。",
      contentMarkdown: "# 🗓️ 週次レポート\n\n## 🌟 今週のハイライト\n\n- [x] **[プロジェクト/機能]** 成果の説明\n- [x] **[プロジェクト/機能]** 成果の説明\n\n## 🚧 ブロッカーとリスク\n\n- ⚠️ **ブロッカー**：原因と必要なサポート\n\n## 🎯 来週の優先事項\n\n- [ ] \n- [ ] \n- [ ] \n\n## 💡 振り返り\n\n- \n",
    },
    {
      title: "Przegląd tygodnia i postępy",
      description: "Podsumuj najważniejsze osiągnięcia tygodnia, blokery i kluczowe priorytety na kolejny tydzień.",
      contentMarkdown: "# 🗓️ Tygodniowy raport postępów\n\n## 🌟 Najważniejsze osiągnięcia\n\n- [x] **[Projekt/funkcja]** Szczegóły osiągnięcia\n- [x] **[Projekt/funkcja]** Szczegóły osiągnięcia\n\n## 🚧 Blokery i ryzyka\n\n- ⚠️ **Bloker**: Przyczyna i potrzebne wsparcie\n\n## 🎯 Priorytety na kolejny tydzień\n\n- [ ] \n- [ ] \n- [ ] \n\n## 💡 Refleksje i wnioski\n\n- \n",
    },
  ),
  seed(
    { key: "reading", translationKey: "reading", tag: "reading" },
    {
      title: "深度閱讀卡片",
      description: "提煉核心觀點、精妙摘錄、個人理解與關聯知識卡片。",
      contentMarkdown: "# 📖 深度閱讀卡片\n\n- **書名/文章**：\n- **作者/來源**：\n- **推薦指數**：⭐⭐⭐⭐⭐\n\n---\n\n## 💡 一句話總結 (Key Takeaway)\n\n> \n\n## ✍️ 核心觀點與金句摘錄\n\n> [摘錄內容]\n> —— *原書/原文*\n\n## 🧠 我的理解與延伸思考\n\n- \n\n## 🔗 關聯知識與行動\n\n- [ ] **落地實踐**：\n",
    },
    {
      title: "Reading Note Card",
      description: "Extract key takeaways, quotes, reflections, and connected concepts.",
      contentMarkdown: "# 📖 Reading Note Card\n\n- **Book/Article**:\n- **Author/Source**:\n- **Rating**: ⭐⭐⭐⭐⭐\n\n---\n\n## 💡 Key Takeaway\n\n> \n\n## ✍️ Highlights & Quotes\n\n> [Quote content]\n> —— *Original Source*\n\n## 🧠 Personal Reflections\n\n- \n\n## 🔗 Action & Practice\n\n- [ ] **Action Plan**:\n",
    },
    {
      title: "読書カード",
      description: "要点、引用、自分の理解、関連する知識をまとめます。",
      contentMarkdown: "# 📖 読書カード\n\n- **書籍/記事**：\n- **著者/出典**：\n- **評価**：⭐⭐⭐⭐⭐\n\n---\n\n## 💡 一言まとめ\n\n> \n\n## ✍️ 要点と引用\n\n> [引用]\n> —— *出典*\n\n## 🧠 自分の理解と考察\n\n- \n\n## 🔗 関連知識とアクション\n\n- [ ] **実践**：\n",
    },
    {
      title: "Karta lektury",
      description: "Wyodrębnij kluczowe wnioski, cytaty, własne refleksje i powiązane zagadnienia.",
      contentMarkdown: "# 📖 Karta lektury\n\n- **Książka/artykuł**:\n- **Autor/źródło**:\n- **Ocena**: ⭐⭐⭐⭐⭐\n\n---\n\n## 💡 Najważniejszy wniosek\n\n> \n\n## ✍️ Najciekawsze fragmenty i cytaty\n\n> [Treść cytatu]\n> —— *Źródło*\n\n## 🧠 Własne refleksje\n\n- \n\n## 🔗 Działanie i praktyka\n\n- [ ] **Plan działania**:\n",
    },
  ),
  seed(
    { key: "okr", translationKey: "okr", tag: "okr" },
    {
      title: "目標與任務拆解",
      description: "明確 OKR 目標、關鍵結果、里程碑與具體執行清單。",
      contentMarkdown: "# 🎯 目標拆解\n\n- **週期**：\n- **負責人**：\n\n---\n\n## 📌 目標 (Objective)\n\n> \n\n## 📈 關鍵結果 (Key Results)\n\n- **KR 1**：期望指標 -> 當前進度\n- **KR 2**：期望指標 -> 當前進度\n\n## 🗓️ 里程碑節點 (Milestones)\n\n- [ ] **階段一 (日期)**：完成標的\n- [ ] **階段二 (日期)**：完成標的\n\n## 📋 執行任務清單\n\n- [ ] \n- [ ] \n",
    },
    {
      title: "Goal & Task Breakdown",
      description: "Define OKRs, Key Results, milestones, and task checklists.",
      contentMarkdown: "# 🎯 Goal Breakdown\n\n- **Period**:\n- **Owner**:\n\n---\n\n## 📌 Objective\n\n> \n\n## 📈 Key Results\n\n- **KR 1**: Target metric -> Current progress\n- **KR 2**: Target metric -> Current progress\n\n## 🗓️ Milestones\n\n- [ ] **Phase 1 (Date)**: Target\n- [ ] **Phase 2 (Date)**: Target\n\n## 📋 Execution Checklist\n\n- [ ] \n- [ ] \n",
    },
    {
      title: "目標とタスク分解",
      description: "OKR の目標、主要な結果、マイルストーン、実行チェックリストを定義します。",
      contentMarkdown: "# 🎯 目標の分解\n\n- **期間**：\n- **担当者**：\n\n---\n\n## 📌 目標 (Objective)\n\n> \n\n## 📈 主要な結果 (Key Results)\n\n- **KR 1**：目標指標 -> 現在の進捗\n- **KR 2**：目標指標 -> 現在の進捗\n\n## 🗓️ マイルストーン\n\n- [ ] **フェーズ 1（日付）**：達成目標\n- [ ] **フェーズ 2（日付）**：達成目標\n\n## 📋 実行チェックリスト\n\n- [ ] \n- [ ] \n",
    },
    {
      title: "Cele i podział zadań",
      description: "Określ cele OKR, kluczowe rezultaty, kamienie milowe i listy zadań.",
      contentMarkdown: "# 🎯 Podział celu\n\n- **Okres**:\n- **Osoba odpowiedzialna**:\n\n---\n\n## 📌 Cel (Objective)\n\n> \n\n## 📈 Kluczowe rezultaty (Key Results)\n\n- **KR 1**: Docelowy wskaźnik -> Obecny postęp\n- **KR 2**: Docelowy wskaźnik -> Obecny postęp\n\n## 🗓️ Kamienie milowe\n\n- [ ] **Etap 1 (data)**: Cel etapu\n- [ ] **Etap 2 (data)**: Cel etapu\n\n## 📋 Lista zadań do wykonania\n\n- [ ] \n- [ ] \n",
    },
  ),
];

export const normalizeMemoTemplateSeedLocale = (
  locale: string | null | undefined,
): MemoTemplateSeedLocale => resolveSupportedLocale(locale);

export const localizeMemoTemplateSeed = (
  templateSeed: MemoTemplateSeed,
  locale: string | null | undefined,
): MemoTemplateSeedTranslation => templateSeed.translations[normalizeMemoTemplateSeedLocale(locale)];

export const defaultMemoTemplateId = (workspaceId: string, seedKey: string) =>
  `${workspaceId}_template_${seedKey}`;

export const memoTemplateSeedTranslations = (locale: MemoTemplateSeedLocale) =>
  Object.fromEntries(DEFAULT_MEMO_TEMPLATE_SEEDS.map((item) => [
    item.translationKey,
    item.translations[locale],
  ])) as Record<MemoTemplateSeed["translationKey"], MemoTemplateSeedTranslation>;

type LocalizableMemoTemplate = {
  id: string;
  name: string;
  description: string | null;
  title: string | null;
  contentMarkdown: string;
  tags: readonly string[];
};

const findUntouchedSeedTranslation = (
  template: LocalizableMemoTemplate,
): MemoTemplateSeed | null => {
  const templateSeed = DEFAULT_MEMO_TEMPLATE_SEEDS.find((item) => template.id.endsWith(`_template_${item.key}`));
  if (!templateSeed) return null;
  const seededTags = ["template", templateSeed.tag];
  if (
    template.tags.length !== seededTags.length
    || template.tags.some((tag, index) => tag !== seededTags[index])
  ) return null;
  const untouched = Object.values(templateSeed.translations).some((translation) =>
    template.name === translation.title
    && template.title === translation.title
    && template.description === translation.description
    && template.contentMarkdown === translation.contentMarkdown);
  return untouched ? templateSeed : null;
};

/**
 * Shows a default template in the viewer's UI language while it still equals
 * one of its seeded translations, including its seeded tags. Templates the
 * user created or edited in any field are returned unchanged.
 */
export const localizeDefaultMemoTemplate = <Template extends LocalizableMemoTemplate>(
  template: Template,
  locale: string | null | undefined,
): Template => {
  const templateSeed = findUntouchedSeedTranslation(template);
  if (!templateSeed) return template;
  const localized = localizeMemoTemplateSeed(templateSeed, locale);
  return {
    ...template,
    name: localized.title,
    title: localized.title,
    description: localized.description,
    contentMarkdown: localized.contentMarkdown,
  };
};
