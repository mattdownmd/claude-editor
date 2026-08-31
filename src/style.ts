/**
 * Design tokens. Colours come from references/color palette.png — sampled from
 * the file, not eyeballed. Nothing here is invented; the only addition to the
 * ten swatches is pure white, used for cards that need to lift off the ground.
 */
export const theme = {
  /** Canvas. Off-white with a cool cast — never pure white. */
  bg: "#EDEEE8",
  /** A card that needs to sit above the ground. */
  surface: "#FFFFFF",

  /** Primary type. Near-black with green in it. */
  ink: "#091409",
  /** Secondary type, sub-labels. */
  muted: "#4C524A",
  /** Tertiary — inactive states and struck-through text. Never body copy. */
  subtle: "#909289",
  /** Hairlines and card borders. */
  line: "#BBC1BB",

  /** Emphasis on a light ground. One idea per shot. */
  accent: "#3F4C33",
  /** Pale olive fill behind accented type, and keywords on a dark ground. */
  accentSoft: "#BDC1A5",
  /** Emphasis on a dark ground — the warm note in the palette. Use sparingly. */
  cream: "#EDEACE",

  /** Dark panel ground: windows, code, terminals. */
  deep: "#23311A",
  /** Chrome inside a dark panel — title bars, raised rows. */
  deepAlt: "#3F4C33",
  /** Mid tone. Connectors, dots, muted marks. */
  olive: "#6C6F5B",
} as const;

/** Syntax roles for code shown on `theme.deep`. */
export const code = {
  text: "#EDEEE8",
  keyword: "#BDC1A5",
  string: "#EDEACE",
  comment: "#909289",
  punct: "#909289",
} as const;

export const font = {
  /** Statement headlines. Warmth and authority — the brand voice. */
  serif: '"Newsreader", Georgia, "Times New Roman", serif',
  /** Interface type: labels, steps, sub-copy, anything inside a window. */
  display: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
  body: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
  /** Anything literal — if a viewer could type it, set it here. */
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
} as const;

export const size = {
  hero: 148,
  title: 96,
  subtitle: 52,
  body: 38,
  label: 26,
} as const;

export const layout = {
  width: 1920,
  height: 1080,
  fps: 30,
  margin: 140,
} as const;

export const radius = {
  window: 26,
  browser: 28,
  card: 22,
  tab: 16,
  pill: 999,
} as const;

/**
 * Windows float; the canvas does not. These are wide and very soft — a hard
 * shadow reads as a sticker, which is the opposite of what we want.
 */
export const shadow = {
  window: "0 40px 90px -34px rgba(9, 20, 9, 0.30)",
  card: "0 24px 56px -28px rgba(9, 20, 9, 0.22)",
  lift: "0 10px 28px -14px rgba(9, 20, 9, 0.16)",
} as const;

export const spring = {
  gentle: { damping: 200, mass: 0.8 },
  snappy: { damping: 26, stiffness: 180, mass: 0.6 },
  bouncy: { damping: 12, stiffness: 140, mass: 0.9 },
} as const;
