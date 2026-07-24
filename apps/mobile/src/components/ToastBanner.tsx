import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import { WORKOUT_MINI_BAR_INSET } from "./WorkoutMiniBar";

export function ToastBanner({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: WORKOUT_MINI_BAR_INSET + 12,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1,
    zIndex: 100,
  },
  text: {
    color: Colors.accent,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
