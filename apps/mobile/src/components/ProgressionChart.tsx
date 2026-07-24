import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from "react-native-svg";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";

export type ChartPoint = {
  value: number;
  label?: string;
};

type Props = {
  points: ChartPoint[];
  height?: number;
  tone?: "heat" | "mint";
  unit?: string;
  /** Hide the big "Now" header for compact embeds */
  compact?: boolean;
  emptyHint?: string;
};

export function ProgressionChart({
  points,
  height = 100,
  tone = "heat",
  unit = "lb",
  compact = false,
  emptyHint = "Log a few sets to see your climb.",
}: Props) {
  if (!points.length) {
    return (
      <View style={[styles.empty, { height: compact ? 64 : height }]}>
        <Text style={styles.emptyText}>{emptyHint}</Text>
      </View>
    );
  }

  const width = 320;
  const padX = 8;
  const padTop = compact ? 8 : 12;
  const padBottom = compact ? 16 : 20;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const span = Math.max(max - min, max * 0.15, 1);
  const barSlot = (width - padX * 2) / points.length;
  const barW = Math.min(compact ? 22 : 28, barSlot * 0.55);

  const yOf = (v: number) =>
    padTop + chartH - ((v - min) / span) * chartH * 0.92;

  const lineD = points
    .map((p, i) => {
      const x = padX + barSlot * i + barSlot / 2;
      const y = yOf(p.value);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const gradId = tone === "heat" ? "barHeat" : "barMint";
  const lineColor = tone === "heat" ? Colors.ctaStart : Colors.glowCyan;
  const tip = points[points.length - 1];

  return (
    <View style={styles.wrap}>
      {!compact && (
        <View style={styles.header}>
          <Text style={styles.nowLabel}>Now</Text>
          <Text style={[styles.nowValue, tone === "mint" && styles.nowMint]}>
            {tip.value}
            <Text style={styles.unit}> {unit}</Text>
          </Text>
        </View>
      )}
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="barHeat" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF8A5B" stopOpacity="1" />
            <Stop offset="1" stopColor="#E8453C" stopOpacity="0.85" />
          </LinearGradient>
          <LinearGradient id="barMint" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#98F2E7" stopOpacity="1" />
            <Stop offset="1" stopColor="#4DB6AC" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {points.map((p, i) => {
          const x = padX + barSlot * i + (barSlot - barW) / 2;
          const y = yOf(p.value);
          const h = padTop + chartH - y;
          const isLast = i === points.length - 1;
          return (
            <Rect
              key={`${p.value}-${i}`}
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 4)}
              rx={6}
              ry={6}
              fill={`url(#${gradId})`}
              opacity={isLast ? 1 : 0.45 + (i / points.length) * 0.4}
            />
          );
        })}

        <Path
          d={lineD}
          stroke={lineColor}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        {points.map((p, i) => {
          const x = padX + barSlot * i + barSlot / 2;
          const y = yOf(p.value);
          const isLast = i === points.length - 1;
          return (
            <Circle
              key={`c-${i}`}
              cx={x}
              cy={y}
              r={isLast ? 5 : 3}
              fill={isLast ? "#fff" : lineColor}
              stroke={lineColor}
              strokeWidth={isLast ? 2 : 0}
            />
          );
        })}
      </Svg>
      <View style={[styles.labels, compact && styles.labelsCompact]}>
        {points.map((p, i) => (
          <Text
            key={`l-${i}`}
            style={[
              styles.label,
              i === points.length - 1 && styles.labelActive,
            ]}
            numberOfLines={1}
          >
            {p.label ?? ""}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  nowLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  nowValue: {
    fontFamily: DISPLAY_FONT,
    fontSize: 32,
    color: Colors.ctaStart,
    letterSpacing: 0.5,
  },
  nowMint: {
    color: Colors.accent,
  },
  unit: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  labels: {
    flexDirection: "row",
    marginTop: -12,
    paddingHorizontal: 4,
  },
  labelsCompact: {
    marginTop: -10,
  },
  label: {
    flex: 1,
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 9,
  },
  labelActive: {
    color: Colors.accent,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.inset,
    borderRadius: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
