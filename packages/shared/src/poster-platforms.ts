// Adapted from Qiaomu Design (MIT), same platform catalog used by the editor.
/** Platform presets: sizes, feed overlays that cover parts of a cover, and file-size limits. */
export interface Zone { x: number; y: number; w: number; h: number; zh: string; en: string }
export interface Platform {
  id: string; zh: string; en: string; icon: string; group: 'social' | 'video' | 'general';
  width: number; height: number; zhHint: string; enHint: string;
  /** Inner text-safe margin as a fraction of the shorter side. */
  margin: number;
  /** Areas the platform usually draws over the cover (timestamps, counters, buttons). */
  avoid: Zone[];
  /** Upload limit in bytes when the platform has a documented one. */
  maxBytes?: number;
}

export const PLATFORMS: Platform[] = [
  { id: 'xhs', zh: '小紅書 · 3:4', en: 'Xiaohongshu · 3:4', icon: 'book-heart', group: 'social', width: 1080, height: 1440, margin: 0.06, avoid: [],
    zhHint: '圖文筆記封面，3:4 豎版最常用', enHint: 'Note cover, 3:4 portrait is the standard' },
  { id: 'xhs-square', zh: '小紅書 · 1:1', en: 'Xiaohongshu · 1:1', icon: 'square', group: 'social', width: 1080, height: 1080, margin: 0.07, avoid: [],
    zhHint: '方形封面，資訊流中更緊湊', enHint: 'Square cover, more compact in the feed' },
  { id: 'youtube', zh: 'YouTube 縮圖', en: 'YouTube thumbnail', icon: 'play', group: 'video', width: 1280, height: 720, margin: 0.04, maxBytes: 2 * 1024 * 1024,
    avoid: [{ x: 0.82, y: 0.86, w: 0.18, h: 0.14, zh: '時長標籤', en: 'Duration' }],
    zhHint: '1280×720，檔案不超過 2MB，右下角會被時長遮擋', enHint: '1280×720, under 2MB; the duration badge covers the bottom-right corner' },
  { id: 'bilibili', zh: 'B 站封面 · 16:10', en: 'Bilibili cover · 16:10', icon: 'tv', group: 'video', width: 1146, height: 717, margin: 0.04,
    avoid: [{ x: 0, y: 0.84, w: 1, h: 0.16, zh: '播放資料條', en: 'Stats bar' }],
    zhHint: '1146×717，資訊流底部會疊加播放與彈幕資料', enHint: '1146×717; the feed overlays play counts along the bottom' },
  { id: 'bilibili-43', zh: 'B 站投稿 · 4:3', en: 'Bilibili upload · 4:3', icon: 'tv', group: 'video', width: 1200, height: 900, margin: 0.05,
    avoid: [{ x: 0, y: 0, w: 1, h: 0.08, zh: '資訊流裁切', en: 'Cropped in feed' }, { x: 0, y: 0.78, w: 1, h: 0.22, zh: '裁切 + 播放資料條', en: 'Crop + stats bar' }],
    zhHint: '1200×900 投稿封面；資訊流裡按 16:10 裁切，文字放在中間 80% 內', enHint: '1200×900 upload cover; the feed crops it to 16:10, keep type in the middle band' },
  { id: 'bilibili-hd', zh: 'B 站 · 16:9 高畫質', en: 'Bilibili · 16:9 HD', icon: 'tv', group: 'video', width: 1920, height: 1080, margin: 0.04,
    avoid: [{ x: 0, y: 0.86, w: 1, h: 0.14, zh: '播放資料條', en: 'Stats bar' }],
    zhHint: '1920×1080，橫版高畫質封面', enHint: '1920×1080 widescreen cover' },
  { id: 'vertical', zh: '抖音 / 影片號 · 9:16', en: 'Douyin / Shorts · 9:16', icon: 'smartphone', group: 'video', width: 1080, height: 1920, margin: 0.06,
    avoid: [{ x: 0, y: 0.78, w: 0.8, h: 0.22, zh: '標題與帳號', en: 'Caption' }, { x: 0.84, y: 0.5, w: 0.16, h: 0.4, zh: '互動按鈕', en: 'Buttons' }],
    zhHint: '豎屏短影片封面，底部和右側會被介面遮擋', enHint: 'Vertical video; captions and buttons cover the bottom and right' },
  { id: 'wechat', zh: '公眾號頭圖 · 2.35:1', en: 'WeChat banner · 2.35:1', icon: 'message-circle', group: 'social', width: 1410, height: 600, margin: 0.05, avoid: [],
    zhHint: '文章頭圖，列表中會被裁為 1:1 小圖，主體放中間', enHint: 'Article banner; the feed crops a square from the centre' },
  { id: 'x', zh: 'X 封面 · 5:2', en: 'X header · 5:2', icon: 'at-sign', group: 'social', width: 1500, height: 600, margin: 0.05, avoid: [{ x: 0, y: 0.55, w: 0.3, h: 0.45, zh: '頭像', en: 'Avatar' }],
    zhHint: '個人主頁橫幅，頭像會遮住左下角', enHint: 'Profile header; the avatar covers the lower-left' },
  { id: 'square', zh: '方形 · 1:1', en: 'Square · 1:1', icon: 'square', group: 'general', width: 1080, height: 1080, margin: 0.06, avoid: [], zhHint: '通用方形', enHint: 'General square' },
  { id: 'wide', zh: '橫版 · 16:9', en: 'Landscape · 16:9', icon: 'rectangle-horizontal', group: 'general', width: 1920, height: 1080, margin: 0.05, avoid: [], zhHint: '通用橫版', enHint: 'General landscape' },
  { id: 'portrait', zh: '豎版 · 3:4', en: 'Portrait · 3:4', icon: 'rectangle-vertical', group: 'general', width: 1200, height: 1600, margin: 0.06, avoid: [], zhHint: '通用豎版', enHint: 'General portrait' },
];

export const DEFAULT_PLATFORM = 'xhs';
export function platformById(id: string | undefined): Platform | undefined { return PLATFORMS.find(p => p.id === id); }
export function platformFor(width: number, height: number, id?: string): Platform | undefined {
  const exact = platformById(id);
  if (exact && exact.width === width && exact.height === height) return exact;
  return PLATFORMS.find(p => p.width === width && p.height === height);
}
export function platformName(p: Platform, zh: boolean): string { return zh ? p.zh : p.en; }
export const GROUPS: { id: Platform['group']; zh: string; en: string }[] = [
  { id: 'social', zh: '圖文平臺', en: 'Social' },
  { id: 'video', zh: '影片平臺', en: 'Video' },
  { id: 'general', zh: '通用比例', en: 'General' },
];
