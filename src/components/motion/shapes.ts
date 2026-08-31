/**
 * House shapes as SVG paths, all drawn in the same 200x200 box so any one can
 * morph into any other. Built as functions rather than string constants so a
 * corner radius or a proportion stays a number you can reason about.
 */

const box = 200;

/** Rounded rectangle centred in the box. */
export const roundedRect = (w: number, h: number, r: number): string => {
  const x = (box - w) / 2;
  const y = (box - h) / 2;
  return [
    `M ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z",
  ].join(" ");
};

export const circle = (d: number): string => roundedRect(d, d, d / 2);

export const square = (s: number, r = 22): string => roundedRect(s, s, r);

/** A 16:9 window. */
export const windowShape = (w = 176): string => roundedRect(w, (w * 9) / 16, 20);

/** Play triangle with softened corners, optically centred. */
export const playTriangle = (size = 130): string => {
  const cx = box / 2 + size * 0.06;
  const cy = box / 2;
  const h = size;
  const w = size * 0.88;
  return [
    `M ${cx - w / 2} ${cy - h / 2}`,
    `L ${cx + w / 2} ${cy - h * 0.04}`,
    `A 10 10 0 0 1 ${cx + w / 2} ${cy + h * 0.04}`,
    `L ${cx - w / 2} ${cy + h / 2}`,
    `A 10 10 0 0 1 ${cx - w / 2 - 6} ${cy + h / 2 - 10}`,
    `L ${cx - w / 2 - 6} ${cy - h / 2 + 10}`,
    `A 10 10 0 0 1 ${cx - w / 2} ${cy - h / 2}`,
    "Z",
  ].join(" ");
};

/**
 * A radial burst — the Claude Code mark's family of form. Built as a single
 * closed star polygon so it can morph cleanly into any other single path.
 */
export const burst = (spokes = 12, outer = 94, inner = 30): string => {
  const c = box / 2;
  const pts: string[] = [];

  for (let i = 0; i < spokes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    // Start at 12 o'clock so the mark reads upright.
    const a = (i / (spokes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${pts.join(" ")} Z`;
};

/** Ring for the Remotion mark, drawn separately so it can sweep in on its own. */
export const ring = (d = 176): string => circle(d);

export const VIEW_BOX = `0 0 ${box} ${box}`;
