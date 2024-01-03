import { View, Text, Pressable } from "react-native";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
export function ToolTip({ close }: { close: () => void }) {
  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: "rgba(80,80,80,.8)",
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        zIndex: 55,
      }}
    >
      <View
        style={{
          padding: 15,
          backgroundColor: Colors.twentyThree,
          margin: 45,
          borderRadius: 8,
          paddingBottom: 40
        }}
      >
        <Pressable onPress={close} style={{ alignSelf: "flex-end" }}>
          <Ionicons name="close-circle" size={25} color={Colors.accent} />
        </Pressable>

        <Text style={{ fontSize: 18, color: Colors.accent }}>Circuit:</Text>
        <Text style={{ fontSize: 16, color: Colors.accent2, marginBottom: 8 }}>
          Circuit training is a workout method that involves moving through a
          series of different exercises, targeting various muscle groups with
          minimal rest between each activity, providing a comprehensive and
          efficient full-body workout. With Circuit selected exercises will alternate in a circuit and you will complete all chosen exercises in rounds.
        </Text>
        <Text style={{ fontSize: 18, color: Colors.accent }}>
          Straight Set:
        </Text>
        <Text style={{ fontSize: 16, color: Colors.accent2 }}>
          Straight sets refer to a traditional strength training approach where
          an individual performs a specific exercise for a designated number of
          sets and repetitions with rest intervals between each set, allowing
          focused and controlled training for individual muscle groups. With Straight Set chosen exercises will repeat linearly or consecutively until your sets are finished before moving on to the next exercise.
        </Text>
      </View>
    </View>
  );
}
