import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring, radius, shadow } from "../style";
import { displayFont } from "../fonts";

/**
 * - `outline` — hairline chrome on a solid dark ground. Reads as a diagram of a
 *   browser rather than a screenshot of one. Use it when the *idea* of the web
 *   is the point.
 * - `solid`   — filled pale chrome. Use it when real content sits inside.
 */
export type BrowserMode = "outline" | "solid";

const Nav: React.FC<{ color: string; s?: number }> = ({ color, s = 26 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.45}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 1 0-2.3 6.1" />
      <path d="M20 5v6h-6" />
    </svg>
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.2V19h11v-8.8" />
    </svg>
  </div>
);

const Lock: React.FC<{ color: string; s?: number }> = ({ color, s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.6" fill={color} stroke="none" />
    <path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" />
  </svg>
);

/**
 * A browser as a graphic object. The chrome is the subject — draw it big, leave
 * the page area empty or hold one thing in it.
 */
export const BrowserWindow: React.FC<{
  url: string;
  tab?: string;
  mode?: BrowserMode;
  delay?: number;
  width?: number | string;
  /** Page area height. Omit to size to `children`. */
  bodyHeight?: number;
  children?: React.ReactNode;
}> = ({ url, tab, mode = "outline", delay = 0, width = "100%", bodyHeight, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.snappy });

  const outline = mode === "outline";
  const stroke = outline ? theme.accentSoft : theme.deep;
  const chromeBg = outline ? "transparent" : theme.accentSoft;
  const pageBg = outline ? "transparent" : theme.bg;
  const urlBg = outline ? theme.deepAlt : theme.deep;
  const urlText = outline ? theme.bg : theme.onClay;

  return (
    <div
      style={{
        width,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.955, 1],
        )})`,
        filter: outline ? "none" : `drop-shadow(${shadow.card})`,
      }}
    >
      {/* tab strip */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "0 26px",
            height: 62,
            border: `2px solid ${stroke}`,
            borderBottom: "none",
            borderTopLeftRadius: radius.browser,
            borderTopRightRadius: radius.tab,
            backgroundColor: chromeBg,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                backgroundColor: stroke,
                opacity: outline ? 0.55 : 0.7,
              }}
            />
          ))}
        </div>

        {tab && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 26px",
              height: 62,
              marginLeft: -2,
              border: `2px solid ${stroke}`,
              borderBottom: "none",
              borderTopLeftRadius: radius.tab,
              borderTopRightRadius: radius.tab,
              backgroundColor: chromeBg,
              fontFamily: displayFont,
              fontSize: 26,
              fontWeight: 600,
              color: stroke,
            }}
          >
            {tab}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" opacity={0.6}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </div>
        )}
      </div>

      {/* address bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "0 30px",
          height: 96,
          border: `2px solid ${stroke}`,
          borderTopLeftRadius: 0,
          borderTopRightRadius: radius.browser,
          backgroundColor: chromeBg,
        }}
      >
        <Nav color={stroke} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 16,
            height: 56,
            padding: "0 26px",
            borderRadius: radius.pill,
            backgroundColor: urlBg,
            fontFamily: displayFont,
            fontSize: 26,
            fontWeight: 500,
            color: urlText,
          }}
        >
          <Lock color={urlText} />
          {url}
        </div>
      </div>

      {/* page */}
      <div
        style={{
          height: bodyHeight,
          borderLeft: `2px solid ${stroke}`,
          borderRight: `2px solid ${stroke}`,
          borderBottom: `2px solid ${stroke}`,
          borderBottomLeftRadius: radius.browser,
          borderBottomRightRadius: radius.browser,
          backgroundColor: pageBg,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
