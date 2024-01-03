import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { WorkoutType } from "../types/types";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import NeomorphicStyles from "../constants/NeomorphicStyles";

const WorkoutTypeDropdown = ({
  type,
  setType,
}: {
  type: string;
  setType: (value: WorkoutType) => void;
}) => {
  const handleChange = (value: WorkoutType) => {
    setType(value);
  };
  const types = ["Circuit", "Straight Set"];

  return (
  
     
      <SelectDropdown
        data={types}
        defaultButtonText={type}
        dropdownOverlayColor={"rgba(80,80,80, .6)"}
        onSelect={(selectedItem, index) => {
          handleChange(selectedItem);
        }}
        rowStyle={{ ...styles.rowText }}
        rowTextStyle={styles.rowText}
        renderCustomizedRowChild={(value) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 5,
            }}
          >
            <Text style={styles.rowText}>{value}</Text>
            <Ionicons name="star-outline" size={12} color={Colors.accent3} />
          </View>
        )}
        buttonStyle={{ ...styles.dropdown, ...styles.dropdownBTN,...NeomorphicStyles}}
        buttonTextStyle={styles.dropdown}
        renderDropdownIcon={() => (
          <Ionicons
            name="arrow-down-circle-outline"
            size={23}
            color={Colors.accent}
            style={{ position: "absolute", top: 5, right: 4 }}
          />
        )}
      />

  );
};

export default WorkoutTypeDropdown;

const styles = StyleSheet.create({
  rowText: {
    backgroundColor: Colors.twentyThree,
    color: Colors.accent,
    fontFamily: "Sonsie",
    fontSize: 14,
    borderBottomColor: "transparent",
  },

  dropdown: {
    color: Colors.accent,
    fontFamily: "Sonsie",
    backgroundColor: "transparent",
       height: 40,
    fontSize: 13,
  },
  dropdownBTN: {
   
    // borderRadius: 4,
    paddingTop: 14,
    marginTop: 2
   
  },
});
