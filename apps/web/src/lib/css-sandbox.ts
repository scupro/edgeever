/**
 * 安全的 CSS 過濾器與作用域限制器
 */

import { sanitizeNoteProseDeclarationBlock } from "@edgeever/shared";

const sanitizeRulesBlock = (block: string): string => sanitizeNoteProseDeclarationBlock(block);

const scopeSelector = (selector: string): string => {
  const trimmed = selector.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith(".ProseMirror") || trimmed.includes(".edgeever-editor")) return trimmed;
  const dark = trimmed.match(/^(?:html\.dark|:root\.dark)\s+(.+)$/);
  if (dark) return `:root.dark .edgeever-editor .ProseMirror ${dark[1]}`;
  return `.edgeever-editor .ProseMirror ${trimmed}`;
};

/**
 * 對使用者的 CSS 進行安全過濾，並將其作用域限定在當前編輯器的 ProseMirror 區域。
 * :root.dark 留在作用域外面，這樣深色規則跟著應用主題走。
 */
export const sanitizeAndScopeCss = (css: string): string => {
  if (!css) return "";

  let cleaned = css
    .replace(/@import/gi, "")
    .replace(/@charset/gi, "")
    .replace(/@namespace/gi, "");

  cleaned = cleaned.replace(/([^{]+)({[^}]+})/g, (_, selectors, blockContent) => {
    const rawRules = blockContent.slice(1, -1);
    const safeRules = sanitizeRulesBlock(rawRules);
    if (!safeRules) return "";

    const scopedSelectors = selectors
      .split(",")
      .map((selector: string) => scopeSelector(selector))
      .filter(Boolean)
      .join(", ");

    return scopedSelectors ? `${scopedSelectors} { ${safeRules} }` : "";
  });

  return cleaned;
};

/** Class on the settings sample. Dark rules bind here instead of :root, so the sample does not follow the app theme. */
export const NOTE_PROSE_CSS_PREVIEW_DARK_CLASS = "note-prose-css-preview-dark";

export const previewNoteProseCss = (css: string): string =>
  sanitizeAndScopeCss(css).replaceAll(":root.dark", `.${NOTE_PROSE_CSS_PREVIEW_DARK_CLASS}`);

/**
 * 動態解析使用者的自定義 CSS，並提取出能直接應用於微信/富文字一鍵複製時的標籤樣式字典
 */
export const parseCustomCssToStyles = (css: string): Record<string, string> => {
  const stylesMap: Record<string, string> = {};
  if (!css) return stylesMap;

  // 使用簡單的正則匹配選擇器和規則內容
  const regex = /([^{]+){([^}]+)}/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    const selectors = match[1].split(",");
    const rawRules = match[2];
    const safeRules = sanitizeRulesBlock(rawRules);

    if (!safeRules) continue;

    selectors.forEach((sel) => {
      const key = sel.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      // 只提取針對純標籤的簡單選擇器（如 h1, p, blockquote 等），這樣便於直接在微信複製裡進行標籤內聯樣式動態覆蓋
      if (/^[a-z0-9]+$/i.test(key)) {
        if (stylesMap[key]) {
          stylesMap[key] = `${stylesMap[key]} ${safeRules}`;
        } else {
          stylesMap[key] = safeRules;
        }
      }
    });
  }

  return stylesMap;
};
