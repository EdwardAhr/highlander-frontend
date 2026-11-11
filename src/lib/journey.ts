// Чистый модуль «скролл-темы» — без DOM, тестируемый.
// Единый монолитный нарратив «вершина → глубокий изумрудный лес» (БЕЗ светлой/тёмной темы):
// поэтапно, поясами высоты — сверху ГОЛУБО-БЕЛОЕ (снег/лёд/небо), снизу ТЁМНЫЙ
// НАСЫЩЕННЫЙ ИЗУМРУД + ЗОЛОТО (без бледного «альпийского луга»). Поверхность/граница
// — тем же путём. Интерполяция в OKLab (перцептивно-равномерно).
// Акцент перетекает голубой → золото; текст внизу светлеет холодным тоном.

export type RGB = readonly [number, number, number];

type OKLab = readonly [number, number, number];
type Stop = { t: number; c: RGB };

/** «Небо» (фон): голубо-белое сверху → глубокий насыщенный изумруд (поясами).
 *  Свал в тёмный изумруд происходит РАНЬШЕ — уже на этапе туров (p≈0.45–0.6). */
const SKY_STOPS: readonly Stop[] = [
  { t: 0.0, c: [238, 246, 251] }, // #EEF6FB — голубо-белый (снег/небо)
  { t: 0.24, c: [221, 237, 243] }, // #DDEDF3 — лёд
  { t: 0.38, c: [180, 214, 220] }, // #B4D6DC — ледник, свал в холод
  { t: 0.46, c: [56, 124, 94] }, // #3C7C5E — вход в изумруд (туры появляются)
  { t: 0.56, c: [22, 92, 66] }, // #165C42 — этап туров: тёмный насыщенный изумруд
  { t: 0.68, c: [12, 72, 52] }, // #0C4834 — глубже
  { t: 1.0, c: [3, 44, 33] }, // #032C21 — подножие (самый тёмный)
];

/** «Полог» (поверхность/карточки): бумага держится, затем уходит в изумруд. */
const CANOPY_STOPS: readonly Stop[] = [
  { t: 0.0, c: [255, 255, 255] }, // #FFFFFF — бумага
  { t: 0.34, c: [255, 255, 255] }, // держится
  { t: 0.42, c: [240, 247, 245] }, // #F0F7F5 — холодная бумага
  { t: 0.5, c: [168, 200, 186] }, // #A8C8BA — зеленеющая бумага
  { t: 0.58, c: [70, 116, 88] }, // #467458 — карточка туров (изумруд)
  { t: 0.72, c: [30, 76, 56] }, // #1E4C38 — глубокая изумрудная карточка
  { t: 1.0, c: [10, 52, 40] }, // #0A3428 — глубокий изумрудный полог
];

/** Граница — лёд → изумруд (не серая шкала). */
const BORDER_STOPS: readonly Stop[] = [
  { t: 0.0, c: [214, 227, 234] }, // #D6E3EA — лёд
  { t: 0.32, c: [185, 205, 212] }, // #B9CDD4
  { t: 0.42, c: [120, 158, 148] }, // #789E94
  { t: 0.55, c: [52, 112, 86] }, // #347056 — изумрудная линия
  { t: 0.7, c: [30, 80, 60] }, // #1E503C — тёмная изумрудная линия
  { t: 1.0, c: [34, 90, 64] }, // #225A40 — кромка полога (светлее фона)
];

/** Высота вершины — брендовая константа лендинга. */
export const TOP_ALT_M = 5642;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// ===== OKLab (Björn Ottosson) =====
const srgbToLinear = (c: number) => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

function rgbToOklab(rgb: RGB): OKLab {
  const [r, g, b] = rgb.map(srgbToLinear);
  const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361452387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToRgb(ok: OKLab): RGB {
  const [L, a, b] = ok;
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const x = 1.2270138511 * l - 0.5577999807 * m + 0.281256149 * s;
  const y = -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s;
  const z = -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s;
  const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const g = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  const clamp = (c: number) => Math.max(0, Math.min(255, Math.round(linearToSrgb(c) * 255)));
  return [clamp(r), clamp(g), clamp(bb)];
}

type OkStop = { t: number; c: OKLab };
const toOkStops = (stops: readonly Stop[]): readonly OkStop[] =>
  stops.map((s) => ({ t: s.t, c: rgbToOklab(s.c) }));

const SKY_OK = toOkStops(SKY_STOPS);
const CANOPY_OK = toOkStops(CANOPY_STOPS);
const BORDER_OK = toOkStops(BORDER_STOPS);

function lerpStops(stops: readonly OkStop[], p: number): RGB {
  const pp = clamp01(p);
  if (pp <= stops[0].t) return oklabToRgb(stops[0].c);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (pp <= b.t) {
      const f = (pp - a.t) / (b.t - a.t);
      return oklabToRgb([
        a.c[0] + (b.c[0] - a.c[0]) * f,
        a.c[1] + (b.c[1] - a.c[1]) * f,
        a.c[2] + (b.c[2] - a.c[2]) * f,
      ]);
    }
  }
  return oklabToRgb(stops[stops.length - 1].c);
}

/** Терраин-палитра (интерполируемые токены) по прогрессу 0..1. */
export function terrainAt(p: number): {
  bg: RGB;
  surface: RGB;
  border: RGB;
} {
  return {
    bg: lerpStops(SKY_OK, p),
    surface: lerpStops(CANOPY_OK, p),
    border: lerpStops(BORDER_OK, p),
  };
}

// ===== FG-токены: вершина (голубо-белое) → изумрудный лес + золото (низ). =====
// Акцент перетекает голубой → золото, текст светлеет. Кросс завершается К ЭТАПУ
// ТУРОВ (p≈0.52) — там уже полностью изумруд + золото.
const FG_WINDOW = { from: 0.40, to: 0.52 };

const FG_TOKENS = {
  // «light» = вершина (голубо-белое), «dark» = низ (тёмный изумруд + золото).
  text: { light: [23, 37, 48] as RGB, dark: [234, 243, 238] as RGB }, // #172530 → #EAF3EE
  muted: { light: [99, 117, 127] as RGB, dark: [190, 214, 196] as RGB }, // #63757F → #BED6C4
  faint: { light: [138, 155, 165] as RGB, dark: [128, 158, 134] as RGB }, // #8A9BA5 → #809E86
  accent: { light: [14, 165, 233] as RGB, dark: [245, 181, 50] as RGB }, // #0EA5E9 → #F5B532 (богатое золото)
  accentHover: { light: [2, 132, 199] as RGB, dark: [250, 200, 76] as RGB }, // #0284C7 → #FAC84C
  accentContrast: { light: [255, 255, 255] as RGB, dark: [24, 16, 2] as RGB }, // #FFFFFF → #181002 (тёмный на золоте)
  fog: { light: [231, 240, 243] as RGB, dark: [16, 56, 42] as RGB }, // #E7F0F3 → #10382A
  borderStrong: { light: [199, 222, 227] as RGB, dark: [34, 96, 68] as RGB }, // #C7DEE3 → #226044
} as const;

export type FgTokenKey = keyof typeof FG_TOKENS;

function oklabMix(a: RGB, b: RGB, t: number): RGB {
  const oa = rgbToOklab(a);
  const ob = rgbToOklab(b);
  return oklabToRgb([
    oa[0] + (ob[0] - oa[0]) * t,
    oa[1] + (ob[1] - oa[1]) * t,
    oa[2] + (ob[2] - oa[2]) * t,
  ]);
}

/** FG-палитра: интерполяция «вершина → глубокий лес» в окне FG_WINDOW. */
export function fgAt(p: number): Record<FgTokenKey, RGB> {
  const f = clamp01((clamp01(p) - FG_WINDOW.from) / (FG_WINDOW.to - FG_WINDOW.from));
  const out = {} as Record<FgTokenKey, RGB>;
  for (const key of Object.keys(FG_TOKENS) as FgTokenKey[]) {
    const { light, dark } = FG_TOKENS[key];
    out[key] = oklabMix(light, dark, f);
  }
  return out;
}

/** Текущая «высота» на странице: 5642 → 0. */
export function altitudeAt(p: number): number {
  return Math.round(TOP_ALT_M - clamp01(p) * TOP_ALT_M);
}

/** Прогресс скролла страницы 0..1 (0 при отсутствии скролла). */
export function progressOf(): number {
  if (typeof document === "undefined") return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/** RGB → #rrggbb. */
export function toHex(rgb: RGB): string {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}
