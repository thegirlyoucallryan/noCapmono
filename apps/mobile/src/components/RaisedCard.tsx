import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Theme from "../constants/Theme";

type Glow = "none" | "cyan" | "purple" | "orange";

type Props = ViewProps & {
  glow?: Glow;
  style?: StyleProp<ViewStyle>;
};

export function RaisedCard({ glow = "none", style, children, ...props }: Props) {
  const glowStyle =
    glow === "cyan"
      ? Theme.glow.cyan
      : glow === "purple"
        ? Theme.glow.purple
        : glow === "orange"
          ? Theme.glow.orange
          : null;

  return (
    <View style={[styles.card, glowStyle, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
  },
});
