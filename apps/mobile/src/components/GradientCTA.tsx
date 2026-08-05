import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import Theme from "../constants/Theme";

type GradientCTAProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  /** primary = orange hero; secondary = cyan accent */
  variant?: "primary" | "secondary";
  /** Tighter padding / type for phones */
  compact?: boolean;
};

export function GradientCTA({
  title,
  onPress,
  disabled = false,
  icon = "play",
  style,
  variant = "primary",
  compact = false,
}: GradientCTAProps) {
  const isSecondary = variant === "secondary";
  const colors = disabled
    ? (["#444", "#333"] as const)
    : isSecondary
      ? ([Colors.glowCyan, "#5B9BD5"] as const)
      : ([...Theme.gradients.cta] as const);

  const glow = disabled
    ? {}
    : isSecondary
      ? Theme.glow.cyan
      : Theme.glow.orange;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        glow,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          compact && styles.gradientCompact,
        ]}
      >
        <Ionicons
          name={icon}
          size={compact ? 18 : 22}
          color={isSecondary ? Colors.twentyThree : "#fff"}
        />
        <Text
          style={[
            styles.title,
            compact && styles.titleCompact,
            isSecondary && styles.titleSecondary,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Theme.radius.xl,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Theme.radius.xl,
  },
  gradientCompact: {
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  titleCompact: {
    fontSize: 14,
    letterSpacing: 0.8,
  },
  titleSecondary: {
    color: Colors.twentyThree,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
});
