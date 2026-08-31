import React from "react";
import { Trail } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  interpolate,
  spring as remotionSpring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { spring } from "../../style";

/**
 * An element thrown into place rather than faded in.
 *
 * Three things make it read as weight instead of a slide: the spring overshoots
 * and settles back, the element rotates slightly on the way, and a trail smears
 * behind it while it is moving fast. Remove any one and it goes back to looking
 * like a transition.
 */
export const Throw: React.FC<{
  children: React.ReactNode;
  delay?: number;
  /** Where it comes from, relative to its resting place. */
  from?: { x?: number; y?: number };
  /** Degrees of spin on the way in. */
  spin?: number;
  /** Motion-blur trail. Costs a render pass per layer — keep it low. */
  trail?: boolean;
  layers?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  from = { x: -420, y: 0 },
  spin = -5,
  trail = true,
  layers = 4,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = remotionSpring({
    frame: frame - delay,
    fps,
    config: spring.bouncy,
  });

  const x = interpolate(enter, [0, 1], [from.x ?? 0, 0]);
  const y = interpolate(enter, [0, 1], [from.y ?? 0, 0]);
  const rot = interpolate(enter, [0, 1], [spin, 0]);

  const body = (
    <div
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        opacity: interpolate(enter, [0, 0.25, 1], [0, 1, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {children}
    </div>
  );

  if (!trail) return body;

  // `Trail` renders its children inside an AbsoluteFill, so on its own it
  // collapses out of the layout and every thrown element stacks in the corner.
  // An invisible copy holds the box; the trail paints on top of it.
  return (
    <div style={{ position: "relative" }}>
      <div style={{ visibility: "hidden" }} aria-hidden>
        {children}
      </div>
      <AbsoluteFill>
        <Trail layers={layers} lagInFrames={1.1} trailOpacity={0.35}>
          {body}
        </Trail>
      </AbsoluteFill>
    </div>
  );
};
