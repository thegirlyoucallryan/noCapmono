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
  return (
    <Modal
      visible={visible}
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
          <Text style={styles.hint}>Tap one to load into My Workout.</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {workouts.length === 0 ? (
              <Text style={styles.empty}>
                Nothing saved yet. Build a session and hit Save.
              </Text>
            ) : (
              workouts.map((w) => (
                <View key={w.id} style={styles.row}>
                  <Pressable
                    style={styles.rowMain}
                    onPress={() => {
                      onLoad(w);
                      onClose();
                    }}
                  >
                    <Ionicons
                      name="bookmark"
                      size={18}
                      color={Colors.accent}
                    />
                    <Text style={styles.name} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.textMuted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(w)}
                    hitSlop={8}
                    style={styles.trash}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={Colors.accent4}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.inset,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 0,
  },
  name: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  trash: {
    padding: 10,
  },
});
