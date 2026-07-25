import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AddFavorite } from "../store/actions";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
import { fetchExercises } from "../../utils/exerciseApi";
import { ExerciseGif } from "../components/ExerciseGif";
import { RaisedCard } from "../components/RaisedCard";
import { GradientCTA } from "../components/GradientCTA";
import { ExerciseProgressCard } from "../components/ExerciseProgressCard";
import {
  navigateToMyWorkout,
  WORKOUT_MINI_BAR_INSET,
} from "../components/WorkoutMiniBar";

const SCREEN_WIDTH = Dimensions.get("window").width;

const WorkoutListDetailScreen = ({ route }: any) => {
  const id = route.params.id;
  const nav = useNavigation();
  const [exercise, setExercise] = useState<Exercise>();
  const dispatch = useDispatch();
  const favoritedExercises = useSelector(
    (s: any) => s.favorites.favoritedExercises
  );
  const alreadyAdded = favoritedExercises.some(
    (e: Exercise) => e.id === id
  );
  const [added, setAdded] = useState(alreadyAdded);

  useEffect(() => {
    setAdded(alreadyAdded);
  }, [alreadyAdded]);

  useEffect(() => {
    if (exercise) {
      nav.setOptions({
        headerShown: true,
        headerTitleStyle: { color: Colors.accent, fontWeight: "100" },
        headerTintColor: Colors.inner,
        headerTitle:
          exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1),
      });
    }
  }, [exercise?.name]);

  const getWorkout = async () => {
    try {
      const resData = await fetchExercises(`/exercises/exercise/${id}`);
      setExercise(resData as Exercise);
    } catch (error: any) {
      console.error("[API error]", error.message);
    }
  };

  useEffect(() => {
    getWorkout();
  }, [id]);

  const handleAdd = () => {
    if (!exercise || added) return;
    dispatch(
      AddFavorite(
        exercise.id,
        exercise.name,
        exercise.gifUrl,
        exercise.equipment,
        exercise.bodyPart
      )
    );
    setAdded(true);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {exercise?.id && (
          <RaisedCard style={styles.gifCard}>
            <ExerciseGif exerciseId={exercise.id} style={styles.image} />
          </RaisedCard>
        )}

        <RaisedCard style={styles.infoCard}>
          <Text style={styles.infoLabel}>Equipment</Text>
          <Text style={styles.infoValue}>{exercise?.equipment ?? "—"}</Text>
          <Text style={[styles.infoLabel, { marginTop: 12 }]}>Target area</Text>
          <Text style={styles.infoValue}>{exercise?.bodyPart ?? "—"}</Text>
        </RaisedCard>

        {id ? (
          <ExerciseProgressCard
            exerciseId={id}
            bodyPart={exercise?.bodyPart}
            equipment={exercise?.equipment}
            exerciseName={exercise?.name}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <GradientCTA
          title={added ? "In your workout" : "Add to workout"}
          icon={added ? "checkmark" : "add"}
          disabled={added || !exercise}
          onPress={handleAdd}
        />

        {added && (
          <Pressable
            onPress={() => navigateToMyWorkout(nav)}
            style={styles.viewWorkout}
          >
            <Text style={styles.viewWorkoutText}>View My Workout →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  gifCard: {
    alignItems: "center",
    padding: 8,
    marginBottom: 16,
  },
  image: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: 22,
  },
  infoCard: {
    padding: 18,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
    textTransform: "capitalize",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: WORKOUT_MINI_BAR_INSET + 12,
    gap: 4,
  },
  viewWorkout: {
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 4,
  },
  viewWorkoutText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default WorkoutListDetailScreen;
