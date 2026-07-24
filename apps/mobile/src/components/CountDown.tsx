import { Text, View, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/Colors";
import Theme from "../constants/Theme";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const CountDown = ({
  time,
  onZero,
}: {
  time: number;
  onZero: () => void;
  setTimer?: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [seconds, setSeconds] = useState<number>(time);
  const [isActive, setIsActive] = useState<boolean>(true);

  const toggle = () => setIsActive(!isActive);

  const handleReset = () => {
    setIsActive(false);
    setSeconds(time);
  };

  const handleSkip = () => {
    setIsActive(false);
    setSeconds(0);
    onZero();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      onZero();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds, isActive, onZero]);

  const label = String(seconds).padStart(2, "0");

  return (
    <View style={styles.wrap}>
      <View style={styles.timerBox}>
        <View style={styles.buttonContainer}>
          <Pressable onPress={toggle}>
            <Text style={styles.startBtn}>
              {isActive ? (
                <Ionicons size={45} name="pause" />
              ) : (
                <Ionicons size={45} name="play" />
              )}
            </Text>
          </Pressable>
        </View>
        <View>
          <Text style={styles.counter}>00:{label}</Text>
          <View style={styles.actions}>
            <Pressable onPress={handleReset}>
              <Text style={styles.pauseBtn}>Reset</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable onPress={handleSkip}>
              <Text style={styles.skipBtn}>Skip</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  timerBox: {
    ...Theme.inset,
    paddingHorizontal: 18,
    padding: 12,
    alignItems: "center",
    borderRadius: Theme.radius.lg,
    margin: 10,
    justifyContent: "center",
    flexDirection: "row",
    ...Theme.glow.cyan,
  },
  counter: {
    color: Colors.glowCyan,
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 20,
  },
  buttonContainer: {
    alignContent: "center",
  },
  startBtn: {
    color: Colors.glowCyan,
    borderColor: Colors.glowCyan,
    borderWidth: 2,
    borderRadius: 200,
    padding: 10,
    paddingRight: 4,
    alignSelf: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
  pauseBtn: {
    fontSize: 18,
    color: Colors.glowCyan,
  },
  skipBtn: {
    fontSize: 18,
    color: Colors.ctaStart,
    fontWeight: "700",
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 18,
  },
});

export default CountDown;
