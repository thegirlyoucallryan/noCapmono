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
};

/**
 * Compact My Workout chip — planned weight × reps without growing the row.
 */
export function TargetWeightChip({
  exerciseId,
  exerciseName,
  bodyPart,
  equipment,
  targetWeight,
  targetReps,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const usesWeight = exerciseUsesWeight({
    bodyPart,
    equipment,
    name: exerciseName,
  });

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

  if (!usesWeight) return null;

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
    setOpen(false);
  };

  const handleClear = () => {
    onSave(null, null);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
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

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
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

              <View style={styles.actions}>
                <Pressable onPress={handleClear} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Clear</Text>
                </Pressable>
                <Pressable onPress={() => setOpen(false)} style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </Pressable>
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
    marginTop: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: Colors.inset,
    borderWidth: 1,
    borderColor: Colors.highlight,
    maxWidth: 120,
  },
  chipSet: {
    borderColor: `${Colors.ctaStart}88`,
    backgroundColor: `${Colors.ctaStart}22`,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextSet: {
    color: Colors.primary,
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
