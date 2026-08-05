import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import type { SavedWorkout } from "../../utils/workoutApi";
import { SavedWorkoutPreviewModal } from "./SavedWorkoutPreviewModal";

type Props = {
  visible: boolean;
  workouts: SavedWorkout[];
  onClose: () => void;
  onLoad: (workout: SavedWorkout) => void;
  onDelete: (workout: SavedWorkout) => void;
};

export function LoadSavedModal({
  visible,
  workouts,
  onClose,
  onLoad,
  onDelete,
}: Props) {
  const [preview, setPreview] = useState<SavedWorkout | null>(null);

  useEffect(() => {
    if (!visible) setPreview(null);
  }, [visible]);

  const handleDelete = async (w: SavedWorkout) => {
    await onDelete(w);
    setPreview(null);
  };

  return (
    <>
      <Modal
        visible={visible && !preview}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Saved workouts</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.hint}>Tap one to preview, then load or delete.</Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {workouts.length === 0 ? (
                <Text style={styles.empty}>
                  Nothing saved yet. Build a session and hit Save.
                </Text>
              ) : (
                workouts.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() => setPreview(w)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <View style={styles.iconWell}>
                      <Ionicons
                        name="bookmark"
                        size={18}
                        color={Colors.glowCyan}
                      />
                    </View>
                    <Text style={styles.name} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <SavedWorkoutPreviewModal
        visible={!!preview}
        workout={preview}
        onClose={() => setPreview(null)}
        onLoad={(w) => {
          onLoad(w);
          onClose();
        }}
        onDelete={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    maxHeight: "70%",
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  list: {
    maxHeight: 360,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: Colors.inset,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
  },
  rowPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glowCyanDim,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
