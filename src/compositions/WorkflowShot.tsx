import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { Ground } from "../components/Ground";
import { WorkflowGraph } from "../components/WorkflowGraph";
import { Kicker } from "../components/Kicker";
import { Statement } from "../components/Statement";
import { layout } from "../style";

export const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  rows: z.array(z.string()).optional(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  accent: z.boolean().optional(),
  frame: z.number().optional(),
});

export const graphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  frame: z.number().optional(),
  draw: z.number().optional(),
});

export const workflowShotSchema = z.object({
  kickerIndex: z.string(),
  kickerLabel: z.string(),
  headline: z.string(),
  headlineFrame: z.number(),
  highlight: z.array(z.string()),
  graphFrame: z.number(),
  stagger: z.number(),
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

/** The handoff between tools, drawn as a node canvas. */
export const WorkflowShot: React.FC<z.infer<typeof workflowShotSchema>> = ({
  kickerIndex,
  kickerLabel,
  headline,
  headlineFrame,
  highlight,
  graphFrame,
  stagger,
  nodes,
  edges,
}) => {
  return (
    <AbsoluteFill>
      <Ground marks={[{ frame: 0, tone: "cream" }]} />
      <AbsoluteFill style={{ padding: layout.margin }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <Kicker index={kickerIndex} label={kickerLabel} delay={0} />
          <Statement
            text={headline}
            delay={headlineFrame}
            fontSize={82}
            maxWidth={1300}
            highlight={highlight}
            italicHighlight
          />
        </div>
        <div style={{ marginTop: "auto" }}>
          <WorkflowGraph
            nodes={nodes}
            edges={edges}
            width={layout.width - layout.margin * 2}
            height={300}
            delay={graphFrame}
            stagger={stagger}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
