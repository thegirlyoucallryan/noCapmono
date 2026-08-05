import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { GradientCTA } from "./GradientCTA";
import type { SavedWorkout } from "../../utils/workoutApi";
import { loadSavedWorkoutExercises } from "../../utils/workoutStore";
import type { Exercise } from "../types/types";

type Props = {
  visible: boolean;
  workout: SavedWorkout | null;
  onClose: () => void;
  onLoad: (workout: SavedWorkout) => void;
  /** Called after user confirms delete */
  onDelete: (workout: SavedWorkout) => void | Promise<void>;
};

function formatTarget(ex: Exercise) {
  const bits: string[] = [];
  if (ex.targetWeight != null) bits.push(`${ex.targetWeight} lb`);
  if (ex.targetReps != null) bits.push(`${ex.targetReps} reps`);
  return bits.join(" · ");
}

export function SavedWorkoutPreviewModal({
  visible,
  workout,
  onClose,
  onLoad,
  onDelete,
}: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * 0.88);
  const listMaxHeight = Math.max(180, Math.round(windowHeight * 0.48));

  useEffect(() => {
    if (!visible || !workout) {
      setExercises([]);
      return;
    }
    let alive = true;
    setLoading(true);
    loadSavedWorkoutExercises(workout.id)
      .then((list) => {
        if (alive) setExercises(list);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [visible, workout?.id]);

  if (!workout) return null;

  const confirmDelete = () => {
    Alert.alert("Delete saved workout", `Remove "${workout.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await onDelete(workout);
            onClose();
          })();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.glowCyan} />
              <Text style={styles.backText}>Saved</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {workout.name}
          </Text>
          <Text style={styles.meta}>
            {loading
              ? "Loading…"
              : `${exercises.length} exercise${
                  exercises.length === 1 ? "" : "s"
                }`}
          </Text>

          <ScrollView
            style={[styles.list, { maxHeight: listMaxHeight }]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            bounces
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <ActivityIndicator
                color={Colors.glowCyan}
                style={{ marginTop: 24 }}
              />
            ) : exercises.length === 0 ? (
              <Text style={styles.empty}>No exercises in this save.</Text>
            ) : (
              exercises.map((ex, i) => {
                const target = formatTarget(ex);
                return (
                  <View key={`${ex.id}-${i}`} style={styles.exRow}>
                    <Text style={styles.exIndex}>{i + 1}</Text>
                    <View style={styles.exBody}>
                      <Text style={styles.exName} numberOfLines={2}>
                        {ex.name.replace(/\(Male\)/i, "").trim()}
                      </Text>
                      {ex.equipment ? (
                        <Text style={styles.exEquip} numberOfLines={1}>
                          {ex.equipment}
                        </Text>
                      ) : null}
                      {target ? (
                        <Text style={styles.exTarget}>{target}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.actions}>
            <GradientCTA
              title="Load workout"
              icon="barbell-outline"
              disabled={loading || exercises.length === 0}
              onPress={() => {
                onLoad(workout);
                onClose();
              }}
              style={styles.loadCta}
            />
            <Pressable
              onPress={confirmDelete}
              hitSlop={8}
              style={({ pressed }) => [
                styles.deleteLink,
                pressed && styles.deletePressed,
              ]}
            >
              <Ionicons name="trash-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: Colors.highlight,
    borderBottomWidth: 0,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.highlight,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backText: {
    color: Colors.glowCyan,
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: 34,
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 4,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
    gap: 8,
    flexGrow: 0,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
    paddingVertical: 20,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.inset,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
  },
  exIndex: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: Colors.glowCyan,
    width: 28,
    marginTop: 1,
  },
  exBody: {
    flex: 1,
    minWidth: 0,
  },
  exName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  exEquip: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    textTransform: "capitalize",
  },
  exTarget: {
    color: Colors.ctaStart,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  actions: {
    marginTop: 20,
    gap: 14,
    alignItems: "center",
  },
  loadCta: {
    width: "100%",
  },
  deleteLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deletePressed: {
    opacity: 0.55,
  },
  deleteText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
