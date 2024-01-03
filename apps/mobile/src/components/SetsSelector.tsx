import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import NeomorphicButton from "./NeomorphicButton";

const SetSelector = ({
  onSelect,

  currentSet,
}: {
  onSelect: (sets: number) => void;
  sets: number;
  currentSet: number;
}) => {
  const increment = () => {
    if (currentSet <= 5) {
      onSelect(currentSet + 1);
    }
  };

  const decrement = () => {
    if (currentSet >= 2) {
      onSelect(currentSet - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.number}>{currentSet}</Text>
      <Text style={styles.sets}>sets</Text>
      <View>
        <NeomorphicButton
          onPress={increment}
          title="&#x25B2;"
          extraButtonStyles={{
            marginHorizontal: 2,
            borderRadius: 2,
            shadowColor: "white",
          }}
          extraTextStyles={{ color: "white", fontSize: 18 }}
        />
        <NeomorphicButton
          onPress={decrement}
          title="&#x25BC;"
          extraButtonStyles={{
            marginHorizontal: 2,
            borderRadius: 2,
            marginTop: 3,
            shadowColor: "white",
          }}
          extraTextStyles={{ color: "white", fontSize: 18 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 5,
    marginVertical: 5,
  },
  button: {
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  number: {
    fontSize: 20,
    color: Colors.accent,
    marginHorizontal: 3,
  },
  sets: {
    color: Colors.accent,
    fontSize: 18,
  },
});

export default SetSelector;
