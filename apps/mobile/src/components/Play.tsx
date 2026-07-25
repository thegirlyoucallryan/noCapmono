import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { View, StyleSheet } from "react-native";
import { WorkoutType } from "../types/types";
import { GradientCTA } from "./GradientCTA";
import {
  requestPlayStart,
  setSessionSettings,
  setWorkout,
} from "../store/actions";

const Play = ({
  favorites,
  sets,
  type,
}: {
  favorites: any;
  sets: number;
  type: WorkoutType | string;
}) => {
  const nav = useNavigation<any>();
  const dispatch = useDispatch();
  const canStart = favorites.length > 0;

  return (
    <View style={styles.screen}>
      <GradientCTA
        title="Start Workout"
        disabled={!canStart}
        onPress={() => {
          dispatch(setWorkout(favorites));
          dispatch(setSessionSettings(sets, String(type)));
          dispatch(requestPlayStart());
          nav.navigate("Play");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 24,
  },
});

export default Play;
