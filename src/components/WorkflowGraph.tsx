import React from "react";
import { interpolate, spring as remotionSpring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, spring, radius, shadow } from "../style";
import { displayFont, monoFont } from "../fonts";

export type GraphNode = {
  id: string;
  label: string;
  /** Small rows inside the card — settings, inputs, whatever the step carries. */
  rows?: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  accent?: boolean;
  frame?: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  frame?: number;
  /** Frames the line takes to draw. */
  draw?: number;
};

const PORT = 11;

/** A check that lands on the output when the script vouches for it. */
const Stamp: React.FC<{ delay: number; x: number; y: number }> = ({ delay, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = remotionSpring({ frame: frame - delay, fps, config: spring.bouncy });
  const draw = interpolate(frame, [delay + 3, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - 28,
        top: y - 28,
        width: 56,
        height: 56,
        borderRadius: "50%",
        backgroundColor: theme.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.4, 1])})`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12.6 L10 17.4 L19 7"
          stroke={theme.deep}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
    </div>
  );
};

/**
 * A node canvas — cards wired together on a dotted field, the way an actual
 * workflow tool looks. Use it when the script describes something being handed
 * from one tool to the next.
 *
 * Positions are explicit canvas pixels rather than a layout engine: a workflow
 * diagram is a *drawing*, and the exact placement is the design.
 */
export const WorkflowGraph: React.FC<{
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  delay?: number;
  stagger?: number;
  /** Stamps a check on accent nodes — for the beat where the output is vouched for. */
  stampFrame?: number;
}> = ({ nodes, edges, width, height, delay = 0, stagger = 16, stampFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const byId = new Map(nodes.map((n, i) => [n.id, { ...n, order: i }]));
  const landedAt = (n: GraphNode, i: number) => n.frame ?? delay + i * stagger;

  return (
    <div style={{ position: "relative", width, height }}>
      {/* edges sit under the cards so they appear to plug into them */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {edges.map((edge, i) => {
          const a = byId.get(edge.from);
          const b = byId.get(edge.to);
          if (!a || !b) return null;

          const x1 = a.x + a.w;
          const y1 = a.y + a.h / 2;
          const x2 = b.x;
          const y2 = b.y + b.h / 2;
          const bend = Math.max(40, Math.abs(x2 - x1) * 0.45);

          // Draws once the card it leaves has settled.
          const start = edge.frame ?? landedAt(a, a.order) + 12;
          const dur = edge.draw ?? 16;
          const draw = interpolate(frame, [start, start + dur], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <path
              key={`${edge.from}-${edge.to}-${i}`}
              d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke={theme.olive}
              strokeWidth={2.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          );
        })}
      </svg>

      {nodes.map((node, i) => {
        const landed = landedAt(node, i);
        const enter = remotionSpring({ frame: frame - landed, fps, config: spring.snappy });
        const dark = node.accent;

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: node.w,
              height: node.h,
              borderRadius: radius.card,
              border: `2px solid ${dark ? theme.deepAlt : theme.line}`,
              backgroundColor: dark ? theme.deep : theme.surface,
              boxShadow: shadow.card,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px) scale(${interpolate(
                enter,
                [0, 1],
                [0.94, 1],
              )})`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 22px",
                borderBottom: node.rows?.length
                  ? `2px solid ${dark ? theme.deepAlt : theme.line}`
                  : "none",
                fontFamily: displayFont,
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: dark ? theme.cream : theme.ink,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  backgroundColor: dark ? theme.cream : theme.accent,
                }}
              />
              {node.label}
            </div>

            {node.rows?.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  padding: "16px 22px",
                  fontFamily: monoFont,
                  fontSize: 21,
                  color: dark ? theme.accentSoft : theme.muted,
                }}
              >
                {node.rows.map((row, r) => (
                  <div key={r}>{row}</div>
                ))}
              </div>
            ) : null}

            {/* ports — the small detail that makes it read as a real canvas */}
            <div
              style={{
                position: "absolute",
                left: -PORT / 2,
                top: node.h / 2 - PORT / 2,
                width: PORT,
                height: PORT,
                borderRadius: "50%",
                backgroundColor: theme.olive,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -PORT / 2,
                top: node.h / 2 - PORT / 2,
                width: PORT,
                height: PORT,
                borderRadius: "50%",
                backgroundColor: theme.accent,
              }}
            />
          </div>
        );
      })}

      {/* Stamps sit on the canvas, not inside the card — a card clips its own
          corners, which would slice the badge in half. */}
      {stampFrame !== undefined &&
        nodes
          .filter((n) => n.accent)
          .map((n) => (
            <Stamp key={`stamp-${n.id}`} delay={stampFrame} x={n.x + n.w} y={n.y} />
          ))}
    </div>
  );
};
