import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Rect,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../constants/Colors";

type Props = {
  style?: ViewStyle;
  /** 0–1 overall strength of the mist lines */
  intensity?: number;
};

/**
 * Soft topographic / smoky mountain texture — like the neomorphic music-app reference.
 * Pure SVG so it stays crisp and light; no photo asset needed.
 */
export function SmokyMountains({ style, intensity = 1 }: Props) {
  const a = (base: number) => Math.min(1, base * intensity);

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="fogLift" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2a2a35" stopOpacity="0.55" />
            <Stop offset="0.45" stopColor="#1e1e26" stopOpacity="0.25" />
            <Stop offset="1" stopColor="#141418" stopOpacity="0" />
          </SvgGradient>
          <SvgGradient id="ridgeFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4a4a4a" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#1a1a1a" stopOpacity="0" />
          </SvgGradient>
        </Defs>

        <Rect x="0" y="0" width="400" height="220" fill="url(#fogLift)" />

        {/* Far ridge mass */}
        <Path
          d="M0 150 C40 138 70 155 110 142 C150 128 175 148 220 135 C265 122 300 145 340 132 C370 124 390 138 400 130 L400 220 L0 220 Z"
          fill="url(#ridgeFill)"
        />

        {/* Contour / smoke lines — layered, soft */}
        <Path
          d="M-10 58 C45 42 90 72 145 52 C200 32 250 68 310 48 C360 34 390 55 420 42"
          stroke={`rgba(255,255,255,${a(0.07)})`}
          strokeWidth="1.2"
          fill="none"
        />
        <Path
          d="M-10 78 C55 60 100 92 160 70 C215 50 270 88 335 68 C380 54 405 78 420 66"
          stroke={`rgba(255,255,255,${a(0.09)})`}
          strokeWidth="1.35"
          fill="none"
        />
        <Path
          d="M-10 98 C50 82 95 112 155 90 C210 70 265 108 330 88 C375 74 400 98 420 90"
          stroke={`rgba(200,200,200,${a(0.11)})`}
          strokeWidth="1.4"
          fill="none"
        />
        <Path
          d="M-10 118 C60 98 105 130 170 108 C225 88 280 128 345 108 C385 96 405 118 420 112"
          stroke={`rgba(180,180,180,${a(0.13)})`}
          strokeWidth="1.5"
          fill="none"
        />
        <Path
          d="M-10 138 C55 120 110 150 175 128 C230 108 285 148 350 128 C390 116 408 138 420 132"
          stroke={`rgba(160,160,160,${a(0.14)})`}
          strokeWidth="1.55"
          fill="none"
        />
        <Path
          d="M-10 158 C50 142 115 170 180 148 C240 128 290 168 355 148 C390 138 410 158 420 152"
          stroke={`rgba(140,140,140,${a(0.12)})`}
          strokeWidth="1.4"
          fill="none"
        />
        <Path
          d="M-10 178 C45 165 120 190 185 168 C245 148 295 188 360 168 C392 158 412 178 420 172"
          stroke={`rgba(120,120,120,${a(0.1)})`}
          strokeWidth="1.25"
          fill="none"
        />

        {/* Soft cyan / purple ambient haze */}
        <Path
          d="M220 40 C280 20 340 55 400 30 L400 100 C350 85 290 70 220 90 Z"
          fill={`rgba(0,212,255,${a(0.07)})`}
        />
        <Path
          d="M0 60 C80 40 140 80 200 55 C260 30 320 75 400 50 L400 95 C300 80 200 65 0 85 Z"
          fill={`rgba(139,92,246,${a(0.05)})`}
        />
        {/* Warm orange accent (brand) */}
        <Path
          d="M280 25 C330 10 370 40 400 28 L400 70 C360 58 310 48 280 58 Z"
          fill={`rgba(255,107,53,${a(0.05)})`}
        />
      </Svg>

      {/* Bottom fade into screen bg so it never hard-cuts */}
      <LinearGradient
        colors={["transparent", "rgba(20,20,24,0.55)", Colors.twentyThree]}
        locations={[0, 0.55, 1]}
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
  },
});
