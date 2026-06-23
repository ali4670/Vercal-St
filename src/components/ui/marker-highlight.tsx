"use client";

import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface MarkerHighlightProps {
  before?: string;
  highlight: string;
  after?: string;
  markerColor?: string;
  baseColor?: string;
  highlightedTextColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

export function MarkerHighlight({
  before = "",
  highlight,
  after = "",
  markerColor = "#CCFF00", // ST ROBOTICS Lime
  baseColor = "#ffffff",
  highlightedTextColor = "#000000",
  backgroundColor = "transparent",
  fontSize = "clamp(2rem, 5vw, 4.5rem)",
  fontWeight = 900,
  speed = 1,
  className,
}: MarkerHighlightProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const markerScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14 },
  });

  const textColor = interpolateColors(
    interpolate(markerScale, [0.5, 0.8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    [0, 1],
    [baseColor, highlightedTextColor],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: backgroundColor,
      }}
    >
      <span
        className={className}
        style={{
          fontSize,
          fontWeight,
          color: baseColor,
          letterSpacing: "-0.03em",
          fontFamily: '"Arial Black", Impact, sans-serif',
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        {before}
        <span style={{ position: "relative", display: "inline-block" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: "0 -0.1em",
              background: markerColor,
              transformOrigin: "left center",
              transform: `scaleX(${markerScale})`,
              zIndex: 0,
              borderRadius: "4px",
            }}
          />
          <span style={{ position: "relative", zIndex: 1, color: textColor }}>
            {highlight}
          </span>
        </span>
        {after}
      </span>
    </div>
  );
}
