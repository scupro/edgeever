/**
 * Font pairing rules. A cover uses at most two families: one display face for the title (and badge) and one calm face for everything
 * else. Each template names a mood; the mood lists candidates best first, and the first installed one wins, so a cover always looks
 * right with what the user has and better with what the starter pack installs.
 *
 * Rules the lists encode:
 *  1. Title = display face, body = neutral face. Never two display faces.
 *  2. Weight contrast does the hierarchy: a single-weight heavy title over a regular body, never bold-on-bold.
 *  3. Heavy display faces are single-weight, so they are never faux-bolded.
 *  4. Serif titles pair with a warm kai/song body; sans titles with a plain gothic body.
 */
export type Mood = 'heavy' | 'punch' | 'tech' | 'trend' | 'warm' | 'serif' | 'brush';
export interface Pair { title: string[]; body: string[]; zh: string }

// The default font library comes first everywhere, so a fresh install looks exactly like the design; system faces only catch
// the moment before the library has landed.
const BODY = ['思源黑體', 'PingFang SC', 'Microsoft YaHei'];
export const MOODS: Record<Mood, Pair> = {
  heavy: { zh: '穩重有力', title: ['思源黑體 Heavy', '阿里巴巴普惠體 Heavy', 'PingFang SC'], body: BODY },
  punch: { zh: '衝擊抓眼', title: ['優設標題黑', '阿里媽媽數黑體', '抖音美好體', '思源黑體 Heavy'], body: BODY },
  tech: { zh: '科技資料', title: ['阿里媽媽數黑體', '未來熒黑', '得意黑', '思源黑體 Heavy'], body: BODY },
  trend: { zh: '潮流年輕', title: ['得意黑', '阿里媽媽數黑體', '抖音美好體', '站酷慶科黃油體'], body: BODY },
  warm: { zh: '親切活潑', title: ['江城圓體', '站酷慶科黃油體', '抖音美好體'], body: BODY },
  serif: { zh: '文藝深度', title: ['思源宋體 Heavy', '朱雀仿宋', '思源宋體', 'Songti SC'], body: ['霞鶩文楷', '思源宋體', ...BODY] },
  brush: { zh: '國風書法', title: ['馬善政楷書', '朱雀仿宋'], body: ['朱雀仿宋', '霞鶩文楷', '思源宋體', ...BODY] },
};

const TEMPLATE_FACES: Record<string, string[]> = {
  neo: ['優設標題黑', '阿里媽媽數黑體'],
  bold: ['阿里媽媽數黑體', '優設標題黑'],
  bili: ['阿里媽媽數黑體', '思源黑體 Heavy'],
  highlight: ['優設標題黑', '思源黑體 Heavy'],
  interview: ['優設標題黑', '阿里媽媽數黑體'],
  frame: ['優設標題黑', '思源黑體 Heavy'],
  kicker: ['阿里媽媽數黑體', '思源黑體 Heavy'],
  stack: ['優設標題黑', '阿里媽媽數黑體', '抖音美好體'],
  regeng: ['抖音美好體', '優設標題黑'],
  keyword: ['得意黑', '優設標題黑'],
  riso: ['站酷快樂體', '站酷慶科黃油體'],
  newspaper: ['思源宋體 Heavy'],
  mag: ['思源宋體 Heavy', '朱雀仿宋'],
  notes: ['霞鶩文楷'],
  numeral: ['未來熒黑', '阿里媽媽數黑體'],
  number: ['阿里媽媽數黑體', '未來熒黑'],
  window: ['未來熒黑', '阿里媽媽數黑體', '得意黑'],
  brush: ['抖音美好體', '思源黑體 Heavy'],
  polaroid: ['霞鶩文楷', '江城圓體', '站酷慶科黃油體'],
};

const MOOD_OF: Record<string, Mood> = {
  minimal: 'heavy', editorial: 'serif', bold: 'punch', dark: 'tech', poster: 'heavy', split: 'heavy', sticker: 'warm', gradient: 'trend', center: 'punch',
  checklist: 'warm', number: 'tech', impact: 'punch', photo: 'heavy', bili: 'punch', compare: 'punch', neo: 'punch', soft: 'serif', swiss: 'heavy',
  acid: 'trend', collage: 'warm', mega: 'heavy', ticker: 'tech', memo: 'warm', pop: 'trend', mag: 'serif', print: 'heavy', glass: 'heavy', bento: 'heavy',
  neon: 'tech', calm: 'serif', seal: 'brush', quote: 'serif', cinema: 'serif',
  highlight: 'punch', notes: 'heavy', chat: 'heavy', keyword: 'punch', riso: 'trend', ticket: 'heavy', window: 'tech', newspaper: 'serif', polaroid: 'warm',
  stack: 'heavy', serial: 'heavy', aurora: 'tech', folio: 'heavy', sage: 'heavy', numeral: 'tech',
  regeng: 'heavy', interview: 'punch', brush: 'punch', calendar: 'heavy', frame: 'heavy', kicker: 'heavy', corner: 'heavy',
};
export const moodOf = (templateId: string | undefined): Mood => MOOD_OF[templateId ?? ''] ?? 'heavy';

/** Faces that ship a real bold. Everything else in the lists is single-weight and must not be faux-bolded. */
// Library faces are one weight per family (思源黑體 / Bold / Heavy are separate families), so only system faces get a real bold.
const HAS_BOLD = new Set(['PingFang SC', 'Songti SC', 'Microsoft YaHei', 'MiSans', '鴻蒙黑體', '阿里巴巴普惠體']);

export interface Resolved { title?: string; body?: string; titleBold: boolean; /** Best title/body families that are not installed yet. */ missing: string[] }
/** Picks the first installed family of each list. `missing` names the top choice per role when it is not installed. */
export function resolvePair(templateId: string | undefined, have: (family: string) => boolean): Resolved {
  const mood = MOODS[moodOf(templateId)];
  const topTitle = TEMPLATE_FACES[templateId ?? '']?.[0] ?? mood.title[0];
  const title = [...(TEMPLATE_FACES[templateId ?? ''] ?? []), ...mood.title, ...BODY].find(have), body = mood.body.find(have);
  const missing = [topTitle, mood.body[0]].filter((f): f is string => !!f && !have(f));
  return { ...(title ? { title } : {}), ...(body ? { body } : {}), titleBold: !!title && HAS_BOLD.has(title), missing: [...new Set(missing)] };
}

/** The pairing the template builders read while they build. Set by the view just before `build`, cleared right after. */
let active: Resolved | undefined;
export function usePairing(r: Resolved | undefined): void { active = r; }
const GENERIC = new Set(['sans-serif', 'serif']);
/** Swaps the generic family a builder asked for with the paired one. Monospace and explicit families are left alone. */
export function typeFor(role: string | undefined, family: string | undefined, weight: string | undefined): { fontFamily?: string; fontWeight?: string } {
  if (!active || !family || !GENERIC.has(family)) return {};
  const display = role === 'title' || role === 'badge';
  const face = display ? active.title : active.body;
  if (!face) return {};
  return { fontFamily: face, ...(display && !active.titleBold && (weight === 'bold' || weight === '700') ? { fontWeight: 'normal' } : {}) };
}
/** Family the title is measured with, so wrapping decisions match what is drawn. */
export const titleFace = (): string => (active?.title ? `"${active.title}"` : 'sans-serif');
