import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { WorkoutType } from "../types/types";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const WORKOUT_TYPES: WorkoutType[] = ["Circuit", "Straight Set"];

const WorkoutTypeDropdown = ({
  type,
  setType,
}: {
  type: string;
  setType: (value: WorkoutType) => void;
}) => {
  return (
    <SelectDropdown
      data={WORKOUT_TYPES}
      defaultButtonText={type}
      onSelect={(selected: WorkoutType) => setType(selected)}
      dropdownOverlayColor="rgba(0,0,0,0.6)"
      buttonStyle={styles.dropdownBtn}
      buttonTextStyle={styles.dropdownText}
      rowStyle={styles.row}
      rowTextStyle={styles.rowText}
      renderCustomizedRowChild={(value: WorkoutType) => (
        <View style={styles.rowInner}>
          <Ionicons
            name={value === "Circuit" ? "repeat" : "list"}
            size={16}
            color={Colors.accent}
          />
          <Text style={styles.rowText}>{value}</Text>
        </View>
      )}
      renderDropdownIcon={() => (
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
      )}
    />
  );
};

export default WorkoutTypeDropdown;

const styles = StyleSheet.create({
  dropdownBtn: {
    backgroundColor: Colors.inset,
    borderRadius: 10,
    height: 36,
    width: 130,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 1,
  },
  dropdownText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.shadowDark,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: {
    color: "#fff",
    fontSize: 14,
  },
});
