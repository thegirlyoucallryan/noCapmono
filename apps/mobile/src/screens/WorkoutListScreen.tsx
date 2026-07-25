import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import ReturnedWorkoutList from "../components/ReturnedWorkoutList";
import Colors from "../constants/Colors";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddFavorite } from "../store/actions";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
import { fetchExercises } from "../../utils/exerciseApi";
import { RaisedCard } from "../components/RaisedCard";
import { InsetButton } from "../components/InsetButton";
import { ExerciseGif } from "../components/ExerciseGif";
import { Ionicons } from "@expo/vector-icons";
import { WORKOUT_MINI_BAR_INSET } from "../components/WorkoutMiniBar";
import { ToastBanner } from "../components/ToastBanner";

const WorkoutList = ({ route }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const nav = useNavigation();
  const searchQuery = route.params?.userInput;
  const equipment = route.params?.equipment;
  const bodyPart = route.params?.bodyPart;
  const { favoritedExercises } = useSelector((s: any) => s.favorites);

  function isExerciseInWorkout(exerciseId: string) {
    return favoritedExercises.some(
      (exercise: Exercise) => exercise.id === exerciseId
    );
  }

  const showToast = useCallback((message: string) => {
    setToast(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const header = searchQuery || equipment || bodyPart || "Exercises";

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      headerTitleStyle: { color: Colors.accent },
      headerTintColor: Colors.inner,
      headerTitle: String(header).charAt(0).toUpperCase() + String(header).slice(1),
    });
  }, [header]);

  const getWorkout = async (isRefresh = false) => {
    let path: string | undefined;
    if (equipment) {
      path = `/exercises/equipment/${encodeURIComponent(equipment)}`;
    } else if (bodyPart) {
      path = `/exercises/bodyPart/${encodeURIComponent(String(bodyPart).toLowerCase())}`;
    } else if (searchQuery) {
      path = `/exercises/name/${encodeURIComponent(searchQuery.toLowerCase())}`;
    }

    if (!path) {
      setError("No search query provided.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchExercises(path);
      const results = Array.isArray(data) ? data : [];
      setExercises(results);
    } catch (err: any) {
      const message = err.message ?? "Request failed";
      console.error("[API error]", path, message);
      setError(
        message.startsWith("403:")
          ? "Couldn't load exercises. Check your API subscription."
          : "Couldn't load exercises. Pull to retry or check your connection."
      );
      setExercises([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getWorkout();
  }, []);

  const dispatch = useDispatch();

  function WorkoutRenderHandler(item: Exercise) {
    const added = isExerciseInWorkout(item.id);

    return (
      <RaisedCard style={styles.row}>
        <TouchableOpacity
          style={styles.rowMain}
          onPress={() => {
            nav.navigate("Display" as never, {
              id: item.id,
              name: item.name,
            } as never);
          }}
        >
          <ExerciseGif
            exerciseId={item.id}
            resolution={180}
            style={styles.thumb}
          />
          <View style={styles.textBlock}>
            <Text numberOfLines={2} style={[styles.name, added && styles.nameAdded]}>
              {item.name}
            </Text>
            <Text style={styles.equipment}>{item.equipment}</Text>
          </View>
        </TouchableOpacity>

        <InsetButton
          size={40}
          onPress={() => {
            if (added) {
              showToast("Already in your workout");
              return;
            }
            dispatch(
              AddFavorite(
                item.id,
                item.name,
                item.gifUrl,
                item.equipment,
                item.bodyPart
              )
            );
            showToast("Added to My Workout");
          }}
        >
          <Ionicons
            name={added ? "checkmark" : "add"}
            size={22}
            color={Colors.accent}
          />
        </InsetButton>
      </RaisedCard>
    );
  }

  return (
    <View style={styles.screen}>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.statusText}>Loading exercises…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <RaisedCard style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={getWorkout}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </RaisedCard>
        </View>
      )}

      {!loading && !error && exercises.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.statusText}>No exercises found. Try another search.</Text>
        </View>
      )}

      {!loading && !error && exercises.length > 0 && (
        <ReturnedWorkoutList
          data={exercises}
          extraData={favoritedExercises.length}
          renderItem={({ item }: any) => WorkoutRenderHandler(item)}
          refreshing={refreshing}
          onRefresh={() => getWorkout(true)}
          listBottomInset={WORKOUT_MINI_BAR_INSET}
        />
      )}
      <ToastBanner message={toast} visible={toastVisible} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 10,
    gap: 10,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: "#fff",
    textTransform: "capitalize",
    fontSize: 15,
    fontWeight: "500",
  },
  nameAdded: {
    color: Colors.accent,
  },
  equipment: {
    color: Colors.textMuted,
    textTransform: "capitalize",
    fontSize: 12,
    marginTop: 2,
  },
  statusText: {
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    fontSize: 15,
  },
  errorCard: {
    padding: 24,
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  errorText: {
    color: Colors.textMuted,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  retryText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default WorkoutList;
