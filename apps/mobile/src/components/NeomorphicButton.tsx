import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import NeomorphicStyles from "../constants/NeomorphicStyles";

const NeomorphicButton = ({
  onPress,
  title,
  icon,
  extraButtonStyles,
  extraTextStyles,
}: {
  onPress: () => void;
  title: string;
  icon?: any;
  extraButtonStyles?: ViewStyle;
  extraTextStyles?: TextStyle;
}) => {
  return (
    <TouchableOpacity
      style={{ ...styles.buttonContainer, ...extraButtonStyles }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={Colors.accent}
          style={{ marginHorizontal: 25 }}
        />
      )}
      <Text style={{ ...styles.buttonText, ...extraTextStyles }}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: NeomorphicStyles,
  buttonText: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default NeomorphicButton;
