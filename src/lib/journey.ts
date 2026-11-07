// Чистый модуль «скролл-темы» — без DOM, тестируемый.
// Модель «граница леса»: фон («небо») меняется широко и плавно через
// живые природные пояса (снег → ледниковое молоко → альпийский луг → ель),
// поверхность/граница («полог») — узким окном. Интерполяция в OKLab
// (перцептивно-равномерное пространство) — хрома не проваливается в «серую яму».
// Текст/акцент/статусы переключаются одним «битом» по яркости ПОВЕРХНОСТИ.

export type RGB = readonly [number, number, number];

type OKLab = readonly [number, number, number];
type Stop = { t: number; c: RGB };

/** «Небо» (фон): снег → ледниковое молоко → альпийский луг → ель. */
const SKY_STOPS: readonly Stop[] = [
  { t: 0.0, c: [247, 250, 252] }, // #F7FAFC — снег
  { t: 0.2, c: [216, 242, 235] }, // #D8F2EB — ледниковое молоко
  { t: 0.3, c: [192, 222, 189] }, // #C0DEBD — проталины
  { t: 0.38, c: [152, 203, 141] }, // #98CB8D — альпийский луг (пик зелени)
  { t: 0.45, c: [65, 118, 85] }, // #417655 — граница леса
  { t: 0.55, c: [11, 45, 35] }, // #0B2D23 — ночная ель (тёмно-зелёный)
  { t: 0.7, c: [7, 28, 21] }, // #071C15
  { t: 0.85, c: [4, 30, 20] }, // #041E14
  { t: 1.0, c: [4, 18, 13] }, // #04120D — подножие
];

/** «Полог» (поверхность): бумага держится светлой, затем провал через хвою. */
const CANOPY_STOPS: readonly Stop[] = [
  { t: 0.0, c: [255, 255, 255] }, // #FFFFFF — бумага
  { t: 0.44, c: [255, 255, 255] }, // держится до провала
  { t: 0.48, c: [228, 244, 225] }, // #E4F4E1 — луговая бумага
  { t: 0.52, c: [102, 138, 114] }, // #668A72 — мокрая хвоя (мид)
  { t: 0.56, c: [34, 63, 48] }, // #223F30 — провал
  { t: 0.6, c: [14, 36, 25] }, // #0E2419 — ночной полог
  { t: 1.0, c: [9, 37, 26] }, // #09251A — подножие
];

/** Граница — ведётся от фона (не серая шкала). */
const BORDER_STOPS: readonly Stop[] = [
  { t: 0.0, c: [214, 227, 234] }, // #D6E3EA — лёд
  { t: 0.32, c: [172, 198, 169] }, // #ACC6A9 — проталины
  { t: 0.42, c: [145, 174, 143] }, // #91AE8F — луговая линия
  { t: 0.52, c: [42, 81, 60] }, // #2A513C — провал
  { t: 0.6, c: [29, 64, 48] }, // #1D4030
  { t: 1.0, c: [19, 53, 39] }, // #133527
];

/** Высота вершины — брендовая константа лендинга. */
export const TOP_ALT_M = 5642;

// Пороги гистерезиса по яркости ПОВЕРХНОСТИ (текст живёт на карточках).
const SURFACE_DARK = 0.17;
const SURFACE_LIGHT = 0.45;

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

/** Относительная яркость цвета (WCAG). */
function luminance(rgb: RGB): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Фаза (светлая/тёмная) с гистерезисом, ключ — яркость ПОВЕРХНОСТИ:
 * тёмная при L(surface) ≤ 0.17, возврат к светлой при L(surface) ≥ 0.45.
 */
export function phaseAt(p: number, prev: "light" | "dark" = "light"): "light" | "dark" {
  const l = luminance(lerpStops(CANOPY_OK, p));
  if (prev === "dark") return l >= SURFACE_LIGHT ? "light" : "dark";
  return l <= SURFACE_DARK ? "dark" : "light";
}

// ===== FG-токены (текст/акцент/вторичные) — плавный кросс в узком окне =====
const FG_WINDOW = { from: 0.44, to: 0.56 };

const FG_TOKENS = {
  text: { light: [23, 37, 48] as RGB, dark: [233, 228, 216] as RGB }, // #172530 → #E9E4D8
  muted: { light: [99, 117, 127] as RGB, dark: [143, 160, 174] as RGB }, // #63757F → #8FA0AE
  faint: { light: [138, 155, 165] as RGB, dark: [90, 107, 120] as RGB }, // #8A9BA5 → #5A6B78
  accent: { light: [62, 124, 140] as RGB, dark: [224, 164, 88] as RGB }, // #3E7C8C → #E0A458
  accentHover: { light: [53, 106, 120] as RGB, dark: [232, 179, 115] as RGB }, // #356A78 → #E8B373
  accentContrast: { light: [255, 255, 255] as RGB, dark: [26, 18, 5] as RGB }, // #FFFFFF → #1A1205
  fog: { light: [231, 240, 243] as RGB, dark: [16, 26, 36] as RGB }, // #E7F0F3 → #101A24
  borderStrong: { light: [199, 222, 227] as RGB, dark: [58, 74, 92] as RGB }, // #C7DEE3 → #3A4A5C
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

/** FG-палитра (текст/акцент/вторичные) — плавный кросс light→dark в окне 0.44–0.56. */
export function fgAt(p: number): Record<FgTokenKey, RGB> {
  const f = clamp01((clamp01(p) - FG_WINDOW.from) / (FG_WINDOW.to - FG_WINDOW.from));
  const out = {} as Record<FgTokenKey, RGB>;
  for (const key of Object.keys(FG_TOKENS) as FgTokenKey[]) {
    const { light, dark } = FG_TOKENS[key];
    out[key] = oklabMix(light, dark, f);
  }
  return out;
}

/** Скаляр «ночь» 0→1 для теней/радиусов — в том же окне, что и FG. */
export function nightAt(p: number): number {
  return clamp01((clamp01(p) - FG_WINDOW.from) / (FG_WINDOW.to - FG_WINDOW.from));
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
