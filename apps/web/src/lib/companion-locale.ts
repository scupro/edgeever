export function companionLocale(language?: string): "zh-TW" | "en-US" | "ja" | "pl" {
  if (language?.startsWith("zh")) return "zh-TW";
  if (language?.startsWith("ja")) return "ja";
  if (language?.startsWith("pl")) return "pl";
  return "en-US";
}
