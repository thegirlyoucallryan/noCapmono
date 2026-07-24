import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import { InsetButton } from "./InsetButton";
import { Ionicons } from "@expo/vector-icons";

const SetSelector = ({
  onSelect,
  currentSet,
}: {
  onSelect: (sets: number) => void;
  sets: number;
  currentSet: number;
}) => {
  const increment = () => {
    if (currentSet < 6) onSelect(currentSet + 1);
  };

  const decrement = () => {
    if (currentSet > 1) onSelect(currentSet - 1);
  };

  return (
    <View style={styles.container}>
      <InsetButton size={28} onPress={decrement}>
        <Ionicons name="remove" size={16} color={Colors.accent} />
      </InsetButton>
      <Text style={styles.number}>{currentSet}</Text>
      <InsetButton size={28} onPress={increment}>
        <Ionicons name="add" size={16} color={Colors.accent} />
      </InsetButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  number: {
    fontSize: 22,
    color: Colors.accent,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
});

export default SetSelector;
