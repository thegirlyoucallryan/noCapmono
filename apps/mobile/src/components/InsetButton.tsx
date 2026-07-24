import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import Theme from "../constants/Theme";
import Colors from "../constants/Colors";

type InsetButtonProps = PressableProps & {
  size?: number;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function InsetButton({
  size = 40,
  active = false,
  style,
  children,
  ...props
}: InsetButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        active && styles.active,
        active && Theme.glow.cyan,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    ...Theme.inset,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    borderBottomColor: Colors.glowCyan,
    borderRightColor: Colors.glowPurple,
  },
});
