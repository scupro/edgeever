const ALLOWED_NOTE_PROSE_CSS_PROPERTIES = new Set([
  "font-family",
  "font-style",
  "font-weight",
  "letter-spacing",
  "color",
  "background",
  "background-color",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-color",
  "border-width",
  "border-style",
  "border-radius",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "text-align",
  "text-decoration",
  "text-transform",
  "text-indent",
  "word-break",
  "word-wrap",
  "white-space",
  "list-style",
  "list-style-type",
]);

const UNSAFE_CSS_VALUE = /url\s*\(|expression|javascript\s*:|behavior|-moz-binding/i;

export const sanitizeNoteProseDeclarationBlock = (block: string): string =>
  block
    .split(";")
    .map((rule) => {
      const parts = rule.split(":");
      if (parts.length < 2) return "";
      const property = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(":").trim();
      if (!ALLOWED_NOTE_PROSE_CSS_PROPERTIES.has(property) || UNSAFE_CSS_VALUE.test(value)) return "";
      return `${property}: ${value};`;
    })
    .filter(Boolean)
    .join(" ");

/** True when a declaration, or an at-rule the sanitizer strips, will not survive save. Comments do not count. */
export const noteProseCssDropsDeclarations = (css: string): boolean => {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/@import|@charset|@namespace/i.test(source)) return true;
  for (const match of source.matchAll(/\{([^{}]*)\}/g)) {
    for (const raw of match[1].split(";")) {
      const declaration = raw.trim();
      if (!declaration.includes(":")) continue;
      if (!sanitizeNoteProseDeclarationBlock(declaration)) return true;
    }
  }
  return false;
};

/** Starter sheet. Each group sets light layout and color, then :root.dark overrides color only. */
export const DEFAULT_NOTE_PROSE_CSS = `/* 同一份樣式。
 * 淺色寫間距和顏色，緊跟著的 :root.dark 只覆蓋顏色。
 * 字號和行高由上面的檔位決定，寫在這裡會被丟掉。
 */

/* 正文。text-indent 是首行縮排，margin-bottom 是段距。 */
p {
  color: #212121;
  text-indent: 0;
  margin-top: 0;
  margin-bottom: 8px;
}

:root.dark p {
  color: #dee3e0;
}

/* 一級標題 */
h1 {
  color: #1a1d21;
  letter-spacing: -0.02em;
  margin-top: 0;
  margin-bottom: 0.85rem;
}

/* 二級標題 */
h2 {
  color: #27272a;
  letter-spacing: -0.015em;
  margin-top: 1.4rem;
  margin-bottom: 0.6rem;
}

/* 三級標題 */
h3 {
  color: #27272a;
  letter-spacing: -0.01em;
  margin-top: 1.15rem;
  margin-bottom: 0.5rem;
}

/* 四級標題 */
h4 {
  color: #1e293b;
  letter-spacing: -0.006em;
  margin-top: 1.05rem;
  margin-bottom: 0.45rem;
}

/* 五級標題 */
h5 {
  color: #334155;
  margin-top: 0.95rem;
  margin-bottom: 0.4rem;
}

/* 六級標題 */
h6 {
  color: #334155;
  margin-top: 0.85rem;
  margin-bottom: 0.35rem;
}

/* 深色 · 標題 */
:root.dark h1,
:root.dark h2,
:root.dark h3,
:root.dark h4,
:root.dark h5,
:root.dark h6 {
  color: #dee3e0;
}

/* 連結 */
a {
  color: #334155;
  text-decoration: underline;
}

:root.dark a {
  color: #dee3e0;
}

/* 粗體 */
strong,
b {
  color: #212121;
}

:root.dark strong,
:root.dark b {
  color: #dee3e0;
}

/* 斜體 */
em,
i {
  color: #212121;
}

:root.dark em,
:root.dark i {
  color: #dee3e0;
}

/* 行內程式碼 */
code {
  color: #3d4450;
  background-color: #f3f5f7;
  border-color: #e1e5ea;
  border-radius: 4px;
  padding: 0.12rem 0.38rem;
}

:root.dark code {
  color: #dee3e0;
  background-color: #2a2e2c;
  border-color: #3a403c;
}

/* 程式碼塊 */
pre {
  color: #0f172a;
  background-color: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}

/* 程式碼塊內部不再套一層行內程式碼的底色 */
pre code {
  color: inherit;
  background-color: transparent;
  border: 0;
  padding: 0;
}

:root.dark pre {
  color: #dee3e0;
  background-color: #1e2422;
  border-color: #3a403c;
}

/* 引用 */
blockquote {
  color: #3d4450;
  background-color: #f3f5f7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

:root.dark blockquote {
  color: #dee3e0;
  background-color: #2a2e2c;
}

/* 分隔線 */
hr {
  border-color: #e7ebe8;
}

:root.dark hr {
  border-color: #3a403c;
}

/* 列表 */
ul,
ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

ul {
  list-style-type: disc;
}

ol {
  list-style-type: decimal;
}

li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* 表格 */
th,
td {
  border-color: #e2e8f0;
  padding: 0.48rem 0.8rem;
  text-align: left;
}

th {
  color: #0f172a;
  background-color: #f1f5f9;
  font-weight: 600;
}

:root.dark th {
  color: #f1f5f9;
  background-color: #2a2e2c;
}

:root.dark th,
:root.dark td {
  border-color: #3a403c;
}
`;

/** Drops font-size, line-height, url(), and rules that are not typography. Selectors stay intact. */
export const sanitizeNoteProseCss = (css: string): string => {
  if (!css) return "";
  const cleaned = css
    .replace(/@import/gi, "")
    .replace(/@charset/gi, "")
    .replace(/@namespace/gi, "");
  return cleaned.replace(/([^{]+)({[^}]+})/g, (_, selectors: string, blockContent: string) => {
    const safeRules = sanitizeNoteProseDeclarationBlock(blockContent.slice(1, -1));
    if (!safeRules) return "";
    return `${selectors}{ ${safeRules} }`;
  }).trim();
};
