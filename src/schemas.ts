import { z } from "zod";

/** Matches the shape written by `npm run transcribe` into src/data/. */
export const timedWordSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

export const strikeItemSchema = z.object({
  text: z.string(),
  enterFrame: z.number(),
  strikeFrame: z.number(),
});

export const pipelineNodeSchema = z.object({
  label: z.string(),
  sub: z.string().optional(),
  accent: z.boolean().optional(),
});

export const stepSchema = z.object({
  label: z.string(),
  sub: z.string().optional(),
});
