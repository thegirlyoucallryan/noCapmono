import { ViewStyle } from "react-native";
import Colors from "./Colors";

/** Shared neumorphic + glow presets for the soft-UI reskin */
export const Theme = {
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    pill: 999,
  },

  /** Raised surface — extruded from background */
  raised: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ViewStyle,

  /** Recessed well — sunken into surface */
  inset: {
    backgroundColor: Colors.inset,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 1.5,
  } satisfies ViewStyle,

  glow: {
    cyan: {
      shadowColor: Colors.glowCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 6,
    } satisfies ViewStyle,
    purple: {
      shadowColor: Colors.glowPurple,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 5,
    } satisfies ViewStyle,
    orange: {
      shadowColor: Colors.ctaStart,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    } satisfies ViewStyle,
  },

  gradients: {
    ambient: [Colors.glowCyanDim, Colors.glowPurpleDim, "transparent"] as const,
    heroRing: [Colors.glowCyan, Colors.glowPurple] as const,
    cta: [Colors.ctaStart, Colors.ctaEnd] as const,
    cyanAccent: [Colors.glowCyan, "#5B9BD5"] as const,
  },
};

export default Theme;
