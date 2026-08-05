import { useMemo } from "react";
import { Dimensions, useWindowDimensions } from "react-native";

/** Phone / split-view threshold (short side). */
export const COMPACT_SHORTEST = 600;

export function isCompactLayout(
  width = Dimensions.get("window").width,
  height = Dimensions.get("window").height
) {
  return Math.min(width, height) < COMPACT_SHORTEST;
}

/**
 * Responsive layout tokens for phone vs tablet.
 * Compact = short side under 600 (phones / split view).
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isCompact = isCompactLayout(width, height);

    // Keep GIF large on phone — still leave room for timer/controls
    const playGifSize = Math.round(
      Math.min(
        width * (isCompact ? 0.9 : 0.9),
        height * (isCompact ? 0.44 : 0.48),
        isCompact ? 400 : 520
      )
    );

    const listGifSize = Math.round(
      Math.min(width * (isCompact ? 0.48 : 0.48), isCompact ? 220 : 280)
    );

    return {
      width,
      height,
      isCompact,
      playGifSize,
      listGifSize,
      space: {
        xs: isCompact ? 4 : 8,
        sm: isCompact ? 8 : 12,
        md: isCompact ? 12 : 16,
        lg: isCompact ? 16 : 24,
        xl: isCompact ? 20 : 32,
      },
      font: {
        hero: isCompact ? 32 : 42,
        title: isCompact ? 22 : 32,
        body: isCompact ? 14 : 16,
        timer: isCompact ? 32 : 42,
        caption: isCompact ? 11 : 13,
      },
      listThumb: isCompact ? 48 : 56,
      listRowPad: isCompact ? 8 : 10,
      listHPad: isCompact ? 12 : 16,
      ctaPadV: isCompact ? 12 : 16,
      ctaPadH: isCompact ? 20 : 32,
      ctaFont: isCompact ? 14 : 16,
      readyTopPad: isCompact ? "10%" : "28%",
    } as const;
  }, [width, height]);
}
