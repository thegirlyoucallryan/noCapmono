import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { Exercise } from "../types/types";
import { ExerciseGif } from "./ExerciseGif";
import { WeightLogger } from "./WeightLogger";
import { SpotifyVibePicker } from "./SpotifyVibePicker";
import Theme from "../constants/Theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  steps: Exercise[];
  currentIndex: number;
  timer: number;
  isActive: boolean;
  onEnd: () => void;
  onJumpTo: (index: number) => void;
  onTogglePause: () => void;
  onResetTimer: () => void;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
  onLogged: (volume: number) => void;
};

export function PlayListSession({
  steps,
  currentIndex,
  timer,
  isActive,
  onEnd,
  onJumpTo,
  onTogglePause,
  onResetTimer,
  onSkip,
  onBack,
  onNext,
  onLogged,
}: Props) {
  const insets = useSafeAreaInsets();
  const timerLabel = String(timer).padStart(2, "0");
  // Tab bar + footer controls — leave room so the last row can scroll up
  const listBottomPad = 160 + Math.max(insets.bottom, 12);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.progress}>
            {currentIndex + 1} / {steps.length}
          </Text>
          <Text style={styles.timer}>00:{timerLabel}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={onTogglePause} style={styles.iconBtn}>
            <Ionicons
              name={isActive ? "pause" : "play"}
              size={22}
              color={Colors.glowCyan}
            />
          </Pressable>
          <Pressable onPress={onSkip} hitSlop={8}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
          <Pressable onPress={onEnd} hitSlop={8}>
            <Text style={styles.end}>End</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={steps}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          const active = index === currentIndex;
          const name = item.name.replace(/\(Male\)/i, "");
          return (
            <Pressable
              onPress={() => onJumpTo(index)}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={styles.rowTop}>
                <Text style={[styles.step, active && styles.stepActive]}>
                  {index + 1}
                </Text>
                <Text
                  style={[styles.rowName, active && styles.rowNameActive]}
                  numberOfLines={2}
                >
                  {name}
                </Text>
                {active ? (
                  <Ionicons name="ellipse" size={8} color={Colors.ctaStart} />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.textMuted}
                  />
                )}
              </View>
              {active && (
                <View style={styles.rowExpanded}>
                  <ExerciseGif
                    key={`${item.id}-${index}`}
                    exerciseId={item.id}
                    style={styles.thumb}
                  />
                  <WeightLogger
                    key={`log-${item.id}-${index}`}
                    exerciseId={item.id}
                    exerciseName={item.name}
                    bodyPart={item.bodyPart}
                    equipment={item.equipment}
                    presetWeight={item.targetWeight}
                    presetReps={item.targetReps}
                    onLogged={onLogged}
                  />
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <SpotifyVibePicker compact />
        <View style={styles.navRow}>
          <Pressable onPress={onBack} style={styles.navBtn}>
            <Ionicons name="caret-back" size={20} color={Colors.glowCyan} />
            <Text style={styles.navText}>Back</Text>
          </Pressable>
          <Pressable onPress={onResetTimer} style={styles.navBtn}>
            <Text style={styles.navTextMuted}>Reset</Text>
          </Pressable>
          <Pressable onPress={onNext} style={styles.navBtn}>
            <Text style={styles.navText}>Next</Text>
            <Ionicons name="caret-forward" size={20} color={Colors.glowCyan} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  progress: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  timer: {
    color: Colors.glowCyan,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    ...Theme.inset,
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    color: Colors.ctaStart,
    fontWeight: "700",
    fontSize: 14,
  },
  end: {
    color: Colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    ...Theme.raised,
    borderRadius: Theme.radius.md,
    padding: 14,
    marginBottom: 10,
  },
  rowActive: {
    borderBottomColor: Colors.glowPurple,
    borderRightColor: Colors.glowCyan,
    backgroundColor: Colors.glowCyanDim,
    ...Theme.glow.cyan,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  step: {
    width: 28,
    color: Colors.textMuted,
    fontWeight: "800",
    fontSize: 15,
  },
  stepActive: {
    color: Colors.glowCyan,
  },
  rowName: {
    flex: 1,
    color: "#ddd",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  rowNameActive: {
    color: "#fff",
  },
  rowExpanded: {
    marginTop: 12,
    gap: 8,
  },
  thumb: {
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.48,
    height: SCREEN_WIDTH * 0.48,
    borderRadius: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.inset,
    paddingTop: 8,
    backgroundColor: Colors.twentyThree,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  navText: {
    color: Colors.glowCyan,
    fontWeight: "700",
    fontSize: 15,
  },
  navTextMuted: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
