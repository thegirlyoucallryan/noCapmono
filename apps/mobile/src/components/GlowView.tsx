import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../constants/Colors";

type GlowTone = "cyan" | "purple" | "orange" | "none";

type Props = ViewProps & {
  tone?: GlowTone;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

const TONE_COLORS: Record<GlowTone, readonly [string, string]> = {
  cyan: [Colors.glowCyanDim, "transparent"],
  purple: [Colors.glowPurpleDim, "transparent"],
  orange: ["rgba(255,107,53,0.14)", "transparent"],
  none: ["transparent", "transparent"],
};

/** Soft ambient halo behind widgets — mimics reference-image bloom */
export function GlowView({
  tone = "cyan",
  intensity = 1,
  style,
  children,
  ...props
}: Props) {
  if (tone === "none") {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]} {...props}>
      <LinearGradient
        colors={[...TONE_COLORS[tone]]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.halo, { opacity: intensity }]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "visible",
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    transform: [{ scale: 1.08 }],
  },
});
