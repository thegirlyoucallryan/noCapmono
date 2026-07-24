import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import Theme from "../constants/Theme";

export function NeomorphicView({ children }: React.PropsWithChildren) {
  return <View style={styles.shell}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
    padding: 20,
    alignItems: "center",
    backgroundColor: Colors.surface,
    ...Theme.glow.purple,
  },
});
