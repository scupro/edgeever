import type {
  AiAction,
  AiPromptParameterKind,
  AiPromptResultMode,
} from "./ai-assistant";
import { resolveSupportedLocale } from "./i18n/locales";

export type AiPromptSeedKey = Exclude<AiAction, "custom">;
export type AiPromptSeedLocale = "zh-TW" | "en-US" | "ja" | "pl";

export type AiPromptSeedTranslation = {
  name: string;
  description: string;
  instruction: string;
};

/** Factory prompt metadata. The top-level text is the Traditional Chinese fallback for legacy callers. */
export type AiPromptSeed = AiPromptSeedTranslation & {
  key: AiPromptSeedKey;
  action: AiPromptSeedKey;
  parameterKind: AiPromptParameterKind;
  resultMode: AiPromptResultMode;
  translations: Record<AiPromptSeedLocale, AiPromptSeedTranslation>;
};

const seed = (
  metadata: Omit<AiPromptSeed, keyof AiPromptSeedTranslation | "translations">,
  zhTW: AiPromptSeedTranslation,
  enUS: AiPromptSeedTranslation,
  ja: AiPromptSeedTranslation,
  pl: AiPromptSeedTranslation,
): AiPromptSeed => ({
  ...metadata,
  ...zhTW,
  translations: { "zh-TW": zhTW, "en-US": enUS, ja, pl },
});

export const normalizeAiPromptSeedLocale = (locale: string | null | undefined): AiPromptSeedLocale =>
  resolveSupportedLocale(locale);

export const localizeAiPromptSeed = (
  promptSeed: AiPromptSeed,
  locale: string | null | undefined,
): AiPromptSeedTranslation => promptSeed.translations[normalizeAiPromptSeedLocale(locale)];

/** Deterministic id for a seeded default prompt in a workspace. */
export const defaultAiPromptId = (workspaceId: string, seedKey: string) =>
  `${workspaceId}_aiprompt_${seedKey}`;

/** Parse legacy deterministic ids. New code should use the persisted seedKey field instead. */
export const parseDefaultAiPromptKey = (promptId: string): AiPromptSeedKey | null => {
  const match = /_aiprompt_([a-z0-9-]+)$/i.exec(promptId);
  if (!match) return null;
  const key = match[1] as AiPromptSeedKey;
  return DEFAULT_AI_PROMPT_SEEDS.some((item) => item.key === key) ? key : null;
};

/**
 * Single application catalog for default prompt behavior and localized copy.
 * Persisted rows only contain user overrides; untouched defaults are materialized from this catalog.
 */
export const DEFAULT_AI_PROMPT_SEEDS: readonly AiPromptSeed[] = [
  seed(
    { key: "summarize", action: "summarize", parameterKind: "none", resultMode: "append" },
    {
      name: "精簡總結",
      description: "壓縮全文，提煉主題、結論與可執行結果",
      instruction: [
        "對筆記做真正的精簡總結，不要逐句改寫、同義複述或回聲式重寫。",
        "識別中心主題、主要主張、關鍵結論與可執行結果。",
        "省略重複、修辭、舉例、引語和次要細節，除非它們對理解關鍵結論必不可少。",
        "較長筆記目標約為原文 20–30% 篇幅，用 3–7 條簡潔 Markdown 要點；短筆記用 1–3 句即可。",
        "不要大段照搬原文，也不要新增原文沒有的資訊。",
        "保持筆記原語言，只返回 Markdown 總結。",
      ].join(""),
    },
    {
      name: "Summarize",
      description: "Condense the note into its topic, conclusions, and actionable outcomes",
      instruction: [
        "Create a genuinely condensed summary of the note rather than rewriting, paraphrasing line by line, or echoing it. ",
        "Identify the central topic, main claims, essential conclusions, and actionable outcomes. ",
        "Omit repetition, rhetorical phrasing, examples, quotations, and minor details unless necessary to understand a key conclusion. ",
        "For a substantial note, target roughly 20–30% of the source length and use 3–7 concise Markdown bullet points; for a short note, use 1–3 concise sentences. ",
        "Do not reproduce long passages verbatim or add facts that are not present in the source. ",
        "Preserve the note's language and return only the summary in Markdown.",
      ].join(""),
    },
    {
      name: "要約する",
      description: "テーマ、結論、実行できる結果に圧縮する",
      instruction: [
        "ノートを本当に要約してください。逐語の言い換え、行ごとの書き換え、エコーのような再述はしないでください。",
        "中心テーマ、主要な主張、重要な結論、実行できる結果を抜き出してください。",
        "繰り返し、修辞、例示、引用、枝葉の詳細は、重要な結論を理解するのに必要でない限り省いてください。",
        "長いノートは原文のおよそ 20–30% を目安に、3–7 個の簡潔な Markdown 箇条書きにしてください。短いノートは 1–3 文で構いません。",
        "長い原文をそのまま写したり、原文にない事実を足したりしないでください。",
        "ノートの言語を保ち、Markdown の要約だけを返してください。",
      ].join(""),
    },
    {
      name: "Podsumuj",
      description: "Streść notatkę do tematu, wniosków i działań do podjęcia",
      instruction: [
        "Utwórz faktycznie skondensowane podsumowanie notatki, zamiast ją przepisywać, parafrazować zdanie po zdaniu lub powtarzać. ",
        "Wskaż główny temat, najważniejsze tezy, kluczowe wnioski i działania do podjęcia. ",
        "Pomiń powtórzenia, ozdobniki retoryczne, przykłady, cytaty i drobne szczegóły, chyba że są niezbędne do zrozumienia kluczowego wniosku. ",
        "W przypadku obszernej notatki celuj w około 20–30% długości oryginału i użyj 3–7 zwięzłych punktów listy Markdown; w przypadku krótkiej notatki wystarczą 1–3 zwięzłe zdania. ",
        "Nie przytaczaj dosłownie długich fragmentów i nie dodawaj faktów, których nie ma w oryginale. ",
        "Zachowaj język notatki i zwróć wyłącznie podsumowanie w formacie Markdown.",
      ].join(""),
    },
  ),
  seed(
    { key: "translate", action: "translate", parameterKind: "target-language", resultMode: "both" },
    {
      name: "全文翻譯",
      description: "翻譯為指定目標語言，保留結構與格式",
      instruction: "將完整筆記翻譯成使用者指定的目標語言。保留原意、Markdown 結構、連結與程式碼塊。只返回譯文，不要評論。",
    },
    {
      name: "Translate",
      description: "Translate into a selected language while preserving formatting",
      instruction: "Translate the complete note into the target language specified by the user. Preserve its meaning, Markdown structure, links, and code blocks. Return only the translated note without commentary.",
    },
    {
      name: "翻訳する",
      description: "指定した言語へ翻訳し、構造と書式を残す",
      instruction: "ノート全体を、ユーザーが指定した目標言語へ翻訳してください。意味、Markdown の構造、リンク、コードブロックは残してください。解説は付けず、訳文だけを返してください。",
    },
    {
      name: "Przetłumacz",
      description: "Przetłumacz na wybrany język, zachowując formatowanie",
      instruction: "Przetłumacz całą notatkę na język docelowy wskazany przez użytkownika. Zachowaj jej znaczenie, strukturę Markdown, linki i bloki kodu. Zwróć wyłącznie przetłumaczoną notatkę, bez komentarzy.",
    },
  ),
  seed(
    { key: "improve-writing", action: "improve-writing", parameterKind: "none", resultMode: "both" },
    {
      name: "潤色表達",
      description: "校正語言並提升文字的清晰度與流暢度",
      instruction: "潤色內容，修正錯別字、語法與標點，改善用詞、句式、清晰度和流暢度，但不要改變原意或刻意縮短內容。保持原語言與有用的 Markdown 格式。只返回潤色後的內容。",
    },
    {
      name: "Polish",
      description: "Correct the language and improve clarity and flow",
      instruction: "Polish the content by correcting spelling, grammar, and punctuation and improving word choice, sentence structure, clarity, and flow. Do not change its meaning or deliberately shorten it. Preserve its language and useful Markdown formatting. Return only the polished content.",
    },
    {
      name: "文章を整える",
      description: "誤字と文法を直し、わかりやすさと流れを上げる",
      instruction: "内容を整えてください。誤字、文法、句読点を直し、語彙、文の形、明瞭さ、流れを改善します。意味を変えたり、意図的に短くしたりしないでください。元の言語と有用な Markdown 書式は残してください。整えた本文だけを返してください。",
    },
    {
      name: "Popraw styl",
      description: "Popraw język oraz zwiększ przejrzystość i płynność tekstu",
      instruction: "Dopracuj treść: popraw pisownię, gramatykę i interpunkcję oraz ulepsz dobór słów, budowę zdań, przejrzystość i płynność. Nie zmieniaj jej znaczenia ani celowo jej nie skracaj. Zachowaj jej język i przydatne formatowanie Markdown. Zwróć wyłącznie dopracowaną treść.",
    },
  ),
  seed(
    { key: "make-shorter", action: "make-shorter", parameterKind: "none", resultMode: "both" },
    {
      name: "精煉表達",
      description: "刪去重複與冗餘，讓表達更簡潔有力",
      instruction: "精煉內容，刪除重複、空話和不必要的修飾，合並可以合併的句子，使表達簡潔、清晰、有力。保留所有關鍵事實、觀點與原意，不要新增新資訊。保持原語言與有用的 Markdown 格式。只返回精煉後的內容。",
    },
    {
      name: "Make concise",
      description: "Remove repetition and make the writing concise and direct",
      instruction: "Refine the content by removing repetition, filler, and unnecessary modifiers and by combining sentences where useful. Make it concise, clear, and direct while preserving every key fact, claim, and the original meaning. Do not add new information. Preserve its language and useful Markdown formatting. Return only the refined content.",
    },
    {
      name: "簡潔にする",
      description: "重複と冗長さを削り、短くはっきり書く",
      instruction: "内容を簡潔にしてください。繰り返し、空疎な言い回し、不要な修飾を削り、まとめられる文はまとめて、短く、はっきり、力強くしてください。重要な事実、主張、元の意味はすべて残し、新しい情報は足さないでください。元の言語と有用な Markdown 書式は残してください。簡潔にした本文だけを返してください。",
    },
    {
      name: "Skróć i uprość",
      description: "Usuń powtórzenia i napisz tekst zwięźle i konkretnie",
      instruction: "Dopracuj treść, usuwając powtórzenia, puste frazy i zbędne określenia oraz łącząc zdania tam, gdzie to pomaga. Spraw, by tekst był zwięzły, jasny i konkretny, zachowując każdy kluczowy fakt, tezę i pierwotne znaczenie. Nie dodawaj nowych informacji. Zachowaj jej język i przydatne formatowanie Markdown. Zwróć wyłącznie dopracowaną treść.",
    },
  ),
  seed(
    { key: "extract-todos", action: "extract-todos", parameterKind: "none", resultMode: "append" },
    {
      name: "提取待辦",
      description: "識別可執行任務，生成任務清單",
      instruction: "從筆記中提取明確或隱含的可執行任務，用 Markdown 任務列表（- [ ]）輸出。保持原語言，不要編造任務。若沒有可執行事項，用原文語言簡短說明。",
    },
    {
      name: "Extract tasks",
      description: "Identify actionable work and produce a task list",
      instruction: "Extract explicit or implied actionable tasks from the note as a Markdown task list using '- [ ]'. Preserve its language and do not invent tasks. If there are no actionable tasks, say so briefly in the note's language.",
    },
    {
      name: "タスクを抜き出す",
      description: "実行できる作業を見つけ、チェックリストにする",
      instruction: "ノートから明示または含意された実行可能なタスクを抜き出し、Markdown のタスクリスト（- [ ]）で出力してください。ノートの言語を保ち、タスクを捏造しないでください。実行できることがなければ、ノートの言語で短くそう書いてください。",
    },
    {
      name: "Wyodrębnij zadania",
      description: "Znajdź działania do wykonania i utwórz listę zadań",
      instruction: "Wyodrębnij z notatki jawne lub domniemane zadania do wykonania jako listę zadań Markdown z użyciem '- [ ]'. Zachowaj jej język i nie wymyślaj zadań. Jeśli nie ma zadań do wykonania, napisz to krótko w języku notatki.",
    },
  ),
  seed(
    { key: "continue-writing", action: "continue-writing", parameterKind: "none", resultMode: "append" },
    {
      name: "繼續寫作",
      description: "從筆記末尾自然續寫",
      instruction: "從筆記結束處自然續寫。只返回新增續寫內容，不要重複原文。保持原語言與 Markdown 風格。",
    },
    {
      name: "Continue writing",
      description: "Continue naturally from the end of the note",
      instruction: "Continue writing naturally from where the note ends. Return only the new continuation, not the original content. Preserve its language and Markdown style.",
    },
    {
      name: "続きを書く",
      description: "ノートの末尾から自然に書き継ぐ",
      instruction: "ノートの終わりから自然に書き継いでください。原文は繰り返さず、新しい続きだけを返してください。元の言語と Markdown の調子を保ってください。",
    },
    {
      name: "Pisz dalej",
      description: "Kontynuuj naturalnie od końca notatki",
      instruction: "Kontynuuj pisanie naturalnie od miejsca, w którym kończy się notatka. Zwróć wyłącznie nową kontynuację, bez oryginalnej treści. Zachowaj jej język i styl Markdown.",
    },
  ),
];

export const getDefaultAiPromptSeed = (key: string) =>
  DEFAULT_AI_PROMPT_SEEDS.find((item) => item.key === key) ?? null;
