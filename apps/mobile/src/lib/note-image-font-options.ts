import { zhTW, enUS } from "@edgeever/shared/i18n";
import { FONT_CATALOG, FONT_IDS } from "@edgeever/shared/font-catalog";
import { NOTE_IMAGE_TEMPLATE_TYPOGRAPHY, resolveTheme, type NoteImageTheme, type NoteImageFontStyle } from "@edgeever/shared/note-image-card";

export const MOBILE_FONT_OPTIONS: Array<{ id: NoteImageFontStyle; labelZh: string; labelEn: string }> = [
  { id: "auto", labelZh: "跟隨主題", labelEn: "Follow Theme" },
  { id: "kai", labelZh: "文楷手書", labelEn: "Handwritten Kai" },
  { id: "serif", labelZh: "文藝襯線", labelEn: "Serif" },
  { id: "sans", labelZh: "現代無襯線", labelEn: "Sans" },
  { id: "mono", labelZh: "極客等寬", labelEn: "Mono" },
  ...FONT_IDS.map(id => ({ id, labelZh: FONT_CATALOG[id].zh, labelEn: FONT_CATALOG[id].en })),
];

export const getMobileNoteImageFontLabel = (
  fontStyle: NoteImageFontStyle,
  theme: NoteImageTheme,
  chinese: boolean,
  includeFollowTheme = false,
): string => {
  const option = MOBILE_FONT_OPTIONS.find(item => item.id === fontStyle);
  const label = option?.[chinese ? "labelZh" : "labelEn"] ?? "";
  if (fontStyle !== "auto") return label;
  const labels = (chinese ? zhTW : enUS).editor.imageShare.templateFonts;
  const themeFontLabel = NOTE_IMAGE_TEMPLATE_TYPOGRAPHY[resolveTheme(undefined, theme)].body
    .map(font => labels[font])
    .join(" / ");
  return includeFollowTheme ? `${label} (${themeFontLabel})` : themeFontLabel;
};
