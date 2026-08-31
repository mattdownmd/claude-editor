import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring, radius, shadow } from "../style";
import { monoFont } from "../fonts";

export type WindowTone = "dark" | "light";

/**
 * A floating application window — the base for every interface shot.
 *
 * Windows are the one element allowed a shadow. They read as sitting *above*
 * the canvas rather than printed on it, which is the whole point; flat panels
 * on a flat ground just look like boxes.
 */
export const Window: React.FC<{
  children: React.ReactNode;
  /** Shown in the title bar, set in mono. Omit for dots only. */
  title?: string;
  tone?: WindowTone;
  delay?: number;
  width?: number | string;
  /** Body padding. */
  pad?: number;
}> = ({ children, title, tone = "dark", delay = 0, width = "100%", pad = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.snappy });

  const dark = tone === "dark";
  const ground = dark ? theme.deep : theme.surface;
  const chrome = dark ? theme.deepAlt : theme.bg;
  const border = dark ? theme.deepAlt : theme.line;
  const titleColor = dark ? theme.accentSoft : theme.muted;

  return (
    <div
      style={{
        width,
        borderRadius: radius.window,
        overflow: "hidden",
        backgroundColor: ground,
        border: `2px solid ${border}`,
        boxShadow: dark ? shadow.window : shadow.card,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.955, 1],
        )})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          height: 58,
          padding: "0 22px",
          backgroundColor: chrome,
          borderBottom: `2px solid ${border}`,
        }}
      >
        <div style={{ display: "flex", gap: 9 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                backgroundColor: dark ? theme.subtle : theme.line,
                opacity: dark ? 0.75 : 1,
              }}
            />
          ))}
        </div>
        {title && (
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 22,
              fontWeight: 500,
              color: titleColor,
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </div>
        )}
      </div>

      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
};

/**
 * One line inside a window, revealed on its own frame. Lines land in sequence
 * rather than all at once — an interface assembling itself, not a static image.
 */
export const WindowLine: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.snappy });

  return (
    <div
      style={{
        ...style,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};
