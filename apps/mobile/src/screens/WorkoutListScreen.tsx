import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ReturnedWorkoutList from "../components/ReturnedWorkoutList";
import Colors from "../constants/Colors";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddFavorite } from "../store/actions";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
import {
  EXERCISE_PAGE_SIZE,
  ExerciseListKind,
  fetchExercisePage,
} from "../../utils/exerciseApi";
import { RaisedCard } from "../components/RaisedCard";
import { InsetButton } from "../components/InsetButton";
import { ExerciseGif } from "../components/ExerciseGif";
import { Ionicons } from "@expo/vector-icons";
import { WORKOUT_MINI_BAR_INSET } from "../components/WorkoutMiniBar";
import { ToastBanner } from "../components/ToastBanner";
import { useLayout } from "../constants/layout";

const WorkoutList = ({ route }: any) => {
  const layout = useLayout();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const nav = useNavigation<any>();
  const searchQuery = route.params?.userInput;
  const equipment = route.params?.equipment;
  const bodyPart = route.params?.bodyPart;
  const { favoritedExercises } = useSelector((s: any) => s.favorites);

  const listQuery: { kind: ExerciseListKind; value: string } | null = equipment
    ? { kind: "equipment", value: String(equipment) }
    : bodyPart
      ? { kind: "bodyPart", value: String(bodyPart).toLowerCase() }
      : searchQuery
        ? { kind: "name", value: String(searchQuery) }
        : null;

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
      headerTitle:
        String(header).charAt(0).toUpperCase() + String(header).slice(1),
    });
  }, [header]);

  const loadPage = useCallback(
    async (mode: "initial" | "refresh" | "more") => {
      if (!listQuery) {
        setError("No search query provided.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (mode === "more") {
        if (loadingMoreRef.current || !hasMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const offset = mode === "more" ? offsetRef.current : 0;

      try {
        const page = await fetchExercisePage(
          listQuery.kind,
          listQuery.value,
          offset,
          EXERCISE_PAGE_SIZE
        );

        setTotal(page.total);
        hasMoreRef.current = page.hasMore;
        setHasMore(page.hasMore);
        offsetRef.current = offset + page.exercises.length;

        if (mode === "more") {
          setExercises((prev) => {
            const seen = new Set(prev.map((e) => e.id));
            const next = page.exercises.filter(
              (e: Exercise) => e?.id && !seen.has(e.id)
            );
            return [...prev, ...next];
          });
        } else {
          setExercises(page.exercises);
        }
      } catch (err: any) {
        const message = err.message ?? "Request failed";
        console.error("[API error]", listQuery, message);
        if (mode !== "more") {
          setError(
            message.startsWith("403:")
              ? "Couldn't load exercises. Check your API subscription."
              : "Couldn't load exercises. Pull to retry or check your connection."
          );
          setExercises([]);
          setHasMore(false);
          hasMoreRef.current = false;
          offsetRef.current = 0;
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [listQuery]
  );

  useEffect(() => {
    offsetRef.current = 0;
    hasMoreRef.current = false;
    setHasMore(false);
    loadPage("initial");
  
  }, [equipment, bodyPart, searchQuery]);

  const dispatch = useDispatch();

  function WorkoutRenderHandler(item: Exercise) {
    const added = isExerciseInWorkout(item.id);
    const thumb = layout.listThumb;
    const addSize = layout.isCompact ? 34 : 40;

    return (
      <RaisedCard
        style={[
          styles.row,
          {
            marginHorizontal: layout.listHPad,
            marginVertical: layout.isCompact ? 4 : 6,
            padding: layout.listRowPad,
            gap: layout.isCompact ? 8 : 10,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.rowMain, { gap: layout.isCompact ? 10 : 12 }]}
          onPress={() => {
            nav.navigate("Display", {
              id: item.id,
              name: item.name,
            });
          }}
        >
          <ExerciseGif
            exerciseId={item.id}
            resolution={180}
            style={{ width: thumb, height: thumb, borderRadius: 10 }}
          />
          <View style={styles.textBlock}>
            <Text
              numberOfLines={2}
              style={[
                styles.name,
                layout.isCompact && { fontSize: 14 },
                added && styles.nameAdded,
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.equipment, layout.isCompact && { fontSize: 12 }]}
            >
              {item.equipment}
            </Text>
          </View>
        </TouchableOpacity>

        <InsetButton
          size={addSize}
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
            size={layout.isCompact ? 18 : 22}
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
            <Ionicons
              name="cloud-offline-outline"
              size={32}
              color={Colors.textMuted}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadPage("initial")}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </RaisedCard>
        </View>
      )}

      {!loading && !error && exercises.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.statusText}>
            No exercises found. Try another search.
          </Text>
        </View>
      )}

      {!loading && !error && exercises.length > 0 && (
        <>
          {total > EXERCISE_PAGE_SIZE ? (
            <Text style={styles.countHint}>
              Showing {exercises.length} of {total}
            </Text>
          ) : null}
          <ReturnedWorkoutList
            data={exercises}
            extraData={favoritedExercises.length}
            renderItem={({ item }: any) => WorkoutRenderHandler(item)}
            refreshing={refreshing}
            onRefresh={() => loadPage("refresh")}
            onEndReached={() => loadPage("more")}
            loadingMore={loadingMore}
            hasMore={hasMore}
            listBottomInset={WORKOUT_MINI_BAR_INSET}
          />
        </>
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
  countHint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
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
