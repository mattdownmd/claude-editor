/**
 * Design tokens, sampled from the reference film in
 * references/ — not eyeballed. Two grounds carry the whole system: a warm
 * parchment cream and Anthropic's clay. Shots alternate between them.
 *
 * The clay is Anthropic's own brand colour. That reads as deliberate on a
 * channel about Claude Code; shift the hue here if you want it to be yours.
 */
export const theme = {
  /** Parchment ground. The default. Flat — never a gradient. */
  bg: "#E9DED1",
  /** Clay ground. The alternate. Use it to mark a change of subject. */
  clay: "#DE8162",
  /** A window or card sitting on either ground. Warm, not pure white. */
  surface: "#FCFAF2",
  /** Pure white, for the inner panes of an interface only. */
  white: "#FFFFFF",

  /** Primary type on cream. Warm near-black. */
  ink: "#1A1312",
  /** Secondary type, sub-labels. */
  muted: "#6B5B52",
  /** Tertiary — inactive states and struck-through text. Never body copy. */
  subtle: "#A2907F",
  /** Hairlines and card borders on cream. */
  line: "#D6C7B8",

  /** Emphasis on cream — the clay, used as ink. One idea per shot. */
  accent: "#C2603F",
  /** Soft clay fill behind accented type. */
  accentSoft: "#F2D9CD",
  /** Type and marks on the clay ground. */
  onClay: "#FFF6F2",
  /** Hairlines and inactive marks on the clay ground. */
  clayLine: "#E9A88F",

  /** Dark panel ground: code and terminals. Warm, not neutral black. */
  deep: "#241A16",
  /** Chrome inside a dark panel — title bars, raised rows. */
  deepAlt: "#3A2A23",
  /** Mid tone. Connectors, window dots, muted marks. */
  olive: "#8A7263",
} as const;

/** Syntax roles for code on a light window — the default on the clay ground. */
export const codeLight = {
  text: "#2A211C",
  keyword: "#B4522E",
  string: "#7A5C36",
  comment: "#A2907F",
  punct: "#8A7263",
} as const;

/** Syntax roles for code shown on `theme.deep`. */
export const code = {
  text: "#F3EAE2",
  keyword: "#E8A184",
  string: "#D8C7A8",
  comment: "#8A7263",
  punct: "#A2907F",
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
  window: 22,
  browser: 24,
  card: 18,
  tab: 14,
  pill: 999,
} as const;

/**
 * Windows float; the ground does not. Wide and very soft — a tight dark shadow
 * reads as a sticker, which is the opposite of what we want.
 */
export const shadow = {
  window: "0 44px 96px -36px rgba(36, 26, 22, 0.34)",
  card: "0 26px 60px -30px rgba(36, 26, 22, 0.26)",
  lift: "0 10px 28px -14px rgba(36, 26, 22, 0.18)",
} as const;

export const spring = {
  gentle: { damping: 200, mass: 0.8 },
  snappy: { damping: 26, stiffness: 180, mass: 0.6 },
  bouncy: { damping: 12, stiffness: 140, mass: 0.9 },
} as const;
