import React, { useLayoutEffect } from "react";
import { getInputProps, useCurrentFrame } from "remotion";

/**
 * The layout check. Tag the boxes that matter with `qa(...)`, mount one
 * <LayoutQA /> inside the composition's root (the root itself carries
 * `data-qa-root`), and render with `node scripts/stills.mjs --qa <Id> <dir> <frames…>`.
 * Faults are printed as `QA {...}` lines: a box outside its container, two boxes
 * in one group touching, a box off the frame, a box under the picture-in-picture
 * (your talking head). A clean run prints `QA: clean`.
 *
 * Without `qa: true` in the input props it does nothing and renders nothing but
 * an invisible frame marker, so it is safe to leave in every composition.
 */

const W = 1920;
const H = 1080;

type Box = { x: number; y: number; w: number; h: number };

/**
 * Props for an element worth checking.
 *   id     — name it so others can sit `in` it
 *   in     — must stay inside the element with this id
 *   group  — boxes in one group must not touch (gap ≥ `gap`, default 16)
 *   bleed  — allowed to run off frame
 *   pip    — allowed under the picture-in-picture
 */
export const qa = (
  name: string,
  o: { id?: string; in?: string; group?: string; gap?: number; bleed?: boolean; pip?: boolean } = {},
) => ({
  "data-qa": name,
  ...(o.id ? { "data-qa-id": o.id } : {}),
  ...(o.in ? { "data-qa-in": o.in } : {}),
  ...(o.group ? { "data-qa-group": o.group } : {}),
  ...(o.gap !== undefined ? { "data-qa-gap": String(o.gap) } : {}),
  ...(o.bleed ? { "data-qa-bleed": "1" } : {}),
  ...(o.pip ? { "data-qa-pip": "1" } : {}),
});

const settledOpacity = (el: Element | null): number => {
  let o = 1;
  for (let e = el as HTMLElement | null; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
  return o;
};

export const LayoutQA: React.FC<{ pip?: Box | null }> = ({ pip = null }) => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!(getInputProps() as { qa?: boolean }).qa) return;
    // Measure against an explicit 1920x1080 marker inside the root: the root's own
    // box can measure 0 wide when it is absolutely positioned in a zero-size host.
    const rect = (el: Element): Box | null => {
      const root = el.closest("[data-qa-root]");
      const marker = root?.querySelector(":scope > [data-qa-frame]");
      if (!marker) return null;
      const R = marker.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!R.width || !r.width || !r.height) return null;
      const k = R.width / W; // stills may render scaled
      return { x: (r.left - R.left) / k, y: (r.top - R.top) / k, w: r.width / k, h: r.height / k };
    };
    // Things in motion are marked data-qa-moving; their positions mean nothing until they settle.
    const live = [...document.querySelectorAll("[data-qa]")].filter(
      (e) =>
        !e.closest("[data-qa-moving]") &&
        (e as HTMLElement).checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) !== false &&
        settledOpacity(e) > 0.85 &&
        rect(e),
    );
    const report = (kind: string, a: string, b = "", r?: Box) =>
      console.log(`QA ${JSON.stringify({ frame, kind, a, b, ...(r ? { at: [r.x, r.y, r.w, r.h].map(Math.round) } : {}) })}`);
    const byId = new Map(live.filter((e) => e.getAttribute("data-qa-id")).map((e) => [e.getAttribute("data-qa-id")!, e]));
    for (const e of live) {
      const n = e.getAttribute("data-qa")!;
      const r = rect(e)!;
      const pin = e.getAttribute("data-qa-in");
      if (pin && byId.has(pin)) {
        const c = rect(byId.get(pin)!)!;
        if (r.x < c.x - 1 || r.y < c.y - 1 || r.x + r.w > c.x + c.w + 1 || r.y + r.h > c.y + c.h + 1) report("outside-container", n, pin);
      }
      if (!e.hasAttribute("data-qa-bleed") && (r.x < -1 || r.y < -1 || r.x + r.w > W + 1 || r.y + r.h > H + 1)) report("off-frame", n, "", r);
      const underPip = !!pip && r.x + r.w > pip.x - 8 && r.y + r.h > pip.y - 8 && r.x < pip.x + pip.w && r.y < pip.y + pip.h;
      if (!e.hasAttribute("data-qa-pip") && underPip) report("under-pip", n);
    }
    const groups = new Map<string, Element[]>();
    for (const e of live) {
      const g = e.getAttribute("data-qa-group");
      if (g) groups.set(g, [...(groups.get(g) ?? []), e]);
    }
    for (const [g, els] of groups) {
      for (let i = 0; i < els.length; i++)
        for (let j = i + 1; j < els.length; j++) {
          const a = rect(els[i])!;
          const b = rect(els[j])!;
          const gap = Number(els[i].getAttribute("data-qa-gap") ?? 16);
          const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
          const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
          if (Math.max(dx, dy) < gap)
            report(Math.max(dx, dy) < 0 ? "overlap" : "too-close", els[i].getAttribute("data-qa")!, `${els[j].getAttribute("data-qa")} (${g})`);
        }
    }
  });
  return <div data-qa-frame="1" style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }} />;
};
