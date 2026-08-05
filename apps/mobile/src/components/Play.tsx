import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
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
  compact = false,
}: {
  favorites: any;
  sets: number;
  type: WorkoutType | string;
  compact?: boolean;
}) => {
  const nav = useNavigation<any>();
  const dispatch = useDispatch();
  const loadedName = useSelector(
    (s: any) => s.favorites.loadedWorkoutName as string | null
  );
  const loadedId = useSelector(
    (s: any) => s.favorites.loadedWorkoutId as string | null
  );
  const canStart = favorites.length > 0;

  return (
    <View style={[styles.screen, compact && styles.screenCompact]}>
      <GradientCTA
        title="Start Workout"
        disabled={!canStart}
        compact={compact}
        onPress={() => {
          dispatch(setWorkout(favorites, loadedName, loadedId));
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
  screenCompact: {
    paddingBottom: 12,
  },
});

export default Play;
