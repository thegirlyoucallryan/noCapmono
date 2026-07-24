import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import Theme from "../constants/Theme";

export type PlayLayoutMode = "tv" | "list";

type Props = {
  value: PlayLayoutMode;
  onChange: (mode: PlayLayoutMode) => void;
};

export function PlayLayoutToggle({ value, onChange }: Props) {
  return (
    <View style={styles.track}>
      <Pressable
        onPress={() => onChange("list")}
        style={[styles.chip, value === "list" && styles.chipActive]}
      >
        {value === "list" ? (
          <LinearGradient
            colors={[Colors.glowCyanDim, Colors.glowPurpleDim]}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <Ionicons
          name="list"
          size={16}
          color={value === "list" ? Colors.glowCyan : Colors.textMuted}
        />
        <Text style={[styles.label, value === "list" && styles.labelActive]}>
          List
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("tv")}
        style={[styles.chip, value === "tv" && styles.chipActive]}
      >
        {value === "tv" ? (
          <LinearGradient
            colors={[Colors.glowPurpleDim, Colors.glowCyanDim]}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <Ionicons
          name="expand-outline"
          size={16}
          color={value === "tv" ? Colors.glowCyan : Colors.textMuted}
        />
        <Text style={[styles.label, value === "tv" && styles.labelActive]}>
          Focus
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
    marginBottom: 16,
    padding: 5,
    borderRadius: Theme.radius.lg,
    ...Theme.inset,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: Theme.radius.sm + 2,
    overflow: "hidden",
  },
  chipActive: {
    ...Theme.raised,
    borderRadius: Theme.radius.sm + 2,
    ...Theme.glow.cyan,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: "#fff",
  },
});
