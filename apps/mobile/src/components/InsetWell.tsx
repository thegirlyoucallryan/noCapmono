import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Theme from "../constants/Theme";

type Props = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

/** Sunken neumorphic container — stat pills, inputs, toggles */
export function InsetWell({ style, children, ...props }: Props) {
  return (
    <View style={[styles.well, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    ...Theme.inset,
    borderRadius: Theme.radius.md,
  },
});
