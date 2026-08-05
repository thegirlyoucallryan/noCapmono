import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Colors from "../constants/Colors";
import {
  getLastLift,
  suggestNextFromLast,
} from "../../utils/workoutStore";
import { exerciseUsesWeight } from "../../utils/exerciseWeight";

type Props = {
  exerciseId: string;
  exerciseName: string;
  bodyPart?: string | null;
  equipment?: string | null;
  targetWeight?: number | null;
  targetReps?: number | null;
  onSave: (weight: number | null, reps: number | null) => void;
  /** Controlled open (My Workout row tap). When set, chip is hidden. */
  visible?: boolean;
  onClose?: () => void;
  /** Hide the inline chip — modal only */
  hideChip?: boolean;
};

/**
 * Target weight × reps editor. Inline chip, or modal-only via visible/hideChip.
 */
export function TargetWeightChip({
  exerciseId,
  exerciseName,
  bodyPart,
  equipment,
  targetWeight,
  targetReps,
  onSave,
  visible,
  onClose,
  hideChip = false,
}: Props) {
  const controlled = visible !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlled ? !!visible : internalOpen;
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const usesWeight = exerciseUsesWeight({
    bodyPart,
    equipment,
    name: exerciseName,
  });

  const close = () => {
    if (controlled) onClose?.();
    else setInternalOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      let nextW =
        targetWeight != null && !Number.isNaN(Number(targetWeight))
          ? String(targetWeight)
          : "";
      let nextR =
        targetReps != null && !Number.isNaN(Number(targetReps))
          ? String(targetReps)
          : "";
      let nextHint: string | null = null;
      try {
        const last = await getLastLift(exerciseId);
        if (last?.weight != null) {
          const w = Number(last.weight);
          const r = last.reps != null ? Number(last.reps) : null;
          const suggested = suggestNextFromLast(w, r);
          if (!nextW) {
            nextW = String(suggested > w ? suggested : w);
          }
          if (!nextR && r != null) nextR = String(r);
          nextHint =
            suggested > w
              ? `Last ${w} lb → suggest ${suggested}`
              : `Last ${w} lb`;
        }
      } catch {
        /* ignore */
      }
      if (!alive) return;
      setWeight(nextW);
      setReps(nextR);
      setHint(nextHint);
    })();
    return () => {
      alive = false;
    };
  }, [open, exerciseId, targetWeight, targetReps]);

  if (!usesWeight && !controlled) return null;

  const label =
    targetWeight != null
      ? `${targetWeight}${targetReps != null ? `×${targetReps}` : " lb"}`
      : "Set wt";

  const handleSave = () => {
    const w = weight.trim() ? parseFloat(weight) : NaN;
    const r = reps.trim() ? parseInt(reps, 10) : NaN;
    onSave(
      Number.isFinite(w) ? w : null,
      Number.isFinite(r) ? r : null
    );
    close();
  };

  const handleClear = () => {
    onSave(null, null);
    close();
  };

  return (
    <>
      {!hideChip && usesWeight ? (
        <Pressable
          onPress={() => (controlled ? onClose?.() : setInternalOpen(true))}
          hitSlop={6}
          style={[styles.chip, targetWeight != null && styles.chipSet]}
        >
          <Text
            style={[styles.chipText, targetWeight != null && styles.chipTextSet]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Pressable>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.centered}
          >
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.title} numberOfLines={2}>
                {exerciseName.replace(/\(Male\)/i, "").trim()}
              </Text>
              <Text style={styles.sub}>Target for this workout</Text>
              {hint ? <Text style={styles.hint}>{hint}</Text> : null}

              {!usesWeight ? (
                <Text style={styles.hint}>
                  This move doesn’t use a weight target.
                </Text>
              ) : (
                <View style={styles.inputs}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Weight</Text>
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="decimal-pad"
                      placeholder="lb"
                      placeholderTextColor={Colors.textMuted}
                      autoFocus
                    />
                  </View>
                  <Text style={styles.times}>×</Text>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="number-pad"
                      placeholder="—"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              )}

              <View style={styles.actions}>
                {usesWeight ? (
                  <Pressable onPress={handleClear} style={styles.btnGhost}>
                    <Text style={styles.btnGhostText}>Clear</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={close} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </Pressable>
                {usesWeight ? (
                  <Pressable onPress={handleSave} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Save</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={close} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Done</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.glowCyanDim,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.45)",
    maxWidth: 132,
  },
  chipSet: {
    borderColor: Colors.glowCyan,
    backgroundColor: "rgba(0, 212, 255, 0.22)",
  },
  chipText: {
    color: Colors.glowCyan,
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextSet: {
    color: Colors.glowCyan,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  centered: {
    width: "100%",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.highlight,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    color: Colors.accent,
    fontSize: 12,
    marginTop: 8,
  },
  inputs: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.inset,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  times: {
    color: Colors.textMuted,
    fontSize: 18,
    paddingBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  btnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btnGhostText: {
    color: Colors.textSoft,
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: Colors.ctaStart,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
