import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import {
  getLastLift,
  logLift,
  suggestNextFromLast,
  volumeFromLog,
} from "../../utils/workoutStore";
import { WeightSuggestionHelp } from "./WeightSuggestionHelp";
import { exerciseUsesWeight } from "../../utils/exerciseWeight";

type Props = {
  exerciseId: string;
  exerciseName: string;
  bodyPart?: string | null;
  equipment?: string | null;
  onLogged?: (volume: number) => void;
};

/**
 * Play weight card — collapsed shows Last vs Suggested side by side.
 * Expanded makes it obvious you're saving a set to history.
 */
export function WeightLogger({
  exerciseId,
  exerciseName,
  bodyPart,
  equipment,
  onLogged,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [lastReps, setLastReps] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const displayName = exerciseName.replace(/\(Male\)/i, "").trim();

  useEffect(() => {
    setExpanded(false);
    setJustSaved(null);
    let alive = true;
    (async () => {
      try {
        const lastLog = await getLastLift(exerciseId);
        if (!alive) return;
        if (lastLog?.weight != null) {
          const w = Number(lastLog.weight);
          const r = lastLog.reps != null ? Number(lastLog.reps) : null;
          const next = suggestNextFromLast(w, r);
          setLastWeight(w);
          setLastReps(r);
          setSuggestion(next > w ? next : null);
          setWeight(String(next > w ? next : w));
          setReps(r != null ? String(r) : "");
        } else {
          setLastWeight(null);
          setLastReps(null);
          setSuggestion(null);
          setWeight("");
          setReps("");
        }
      } catch {
        if (alive) {
          setLastWeight(null);
          setLastReps(null);
          setSuggestion(null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [exerciseId]);

  const delta =
    suggestion != null && lastWeight != null
      ? suggestion - lastWeight
      : null;

  const openPanel = () => {
    setJustSaved(null);
    setExpanded(true);
  };

  const useSuggested = () => {
    if (suggestion == null) return;
    setWeight(String(suggestion));
    if (lastReps != null) setReps(String(lastReps));
  };

  const useLast = () => {
    if (lastWeight == null) return;
    setWeight(String(lastWeight));
    if (lastReps != null) setReps(String(lastReps));
  };

  const handleLog = async () => {
    const w = parseFloat(weight);
    const r = reps.trim() ? parseInt(reps, 10) : undefined;
    if (Number.isNaN(w)) return;
    setSaving(true);
    try {
      await logLift({
        exerciseId,
        exerciseName,
        weight: w,
        reps: r != null && !Number.isNaN(r) ? r : undefined,
      });
      onLogged?.(
        volumeFromLog(w, r != null && !Number.isNaN(r) ? r : undefined, 1)
      );
      setLastWeight(w);
      setLastReps(r != null && !Number.isNaN(r) ? r : null);
      const next = suggestNextFromLast(
        w,
        r != null && !Number.isNaN(r) ? r : undefined
      );
      setSuggestion(next > w ? next : null);
      const savedLine =
        `${w} lb` + (r != null && !Number.isNaN(r) ? ` × ${r}` : "");
      setJustSaved(savedLine);
      setExpanded(false);
      setTimeout(() => setJustSaved(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (!exerciseUsesWeight({ bodyPart, equipment, name: exerciseName })) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => (expanded ? setExpanded(false) : openPanel())}
        style={[styles.card, expanded && styles.cardOpen]}
        hitSlop={4}
      >
        {justSaved ? (
          <View style={styles.savedRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
            <Text style={styles.savedText}>Saved {justSaved}</Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Last</Text>
              <Text style={styles.statValue}>
                {lastWeight != null ? (
                  <>
                    {lastWeight}
                    <Text style={styles.statUnit}> lb</Text>
                    {lastReps != null ? (
                      <Text style={styles.statReps}> × {lastReps}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.statEmpty}>—</Text>
                )}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.statLabel}>Suggested</Text>
                <WeightSuggestionHelp size={15} inline />
              </View>
              <Text style={[styles.statValue, styles.statSuggested]}>
                {suggestion != null ? (
                  <>
                    {suggestion}
                    <Text style={styles.statUnit}> lb</Text>
                    {delta != null && delta > 0 ? (
                      <Text style={styles.statDelta}> +{delta}</Text>
                    ) : null}
                  </>
                ) : lastWeight != null ? (
                  <>
                    {lastWeight}
                    <Text style={styles.statUnit}> lb</Text>
                  </>
                ) : (
                  <Text style={styles.statEmpty}>—</Text>
                )}
              </Text>
            </View>

            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.textMuted}
              style={styles.chevron}
            />
          </View>
        )}
      </Pressable>

      {expanded && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Save this set</Text>
          <Text style={styles.panelHint}>
            Stores weight & reps for{" "}
            <Text style={styles.panelExercise}>{displayName}</Text> — used for
            last/suggested next time.
          </Text>

          <View style={styles.quickRow}>
            {suggestion != null && (
              <Pressable onPress={useSuggested} style={styles.quickChip}>
                <Text style={styles.quickChipText}>Use {suggestion} lb</Text>
              </Pressable>
            )}
            {lastWeight != null && (
              <Pressable onPress={useLast} style={styles.quickChipMuted}>
                <Text style={styles.quickChipMutedText}>
                  Use last ({lastWeight} lb)
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.inputs}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.times}>×</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <Pressable
              style={[styles.logBtn, saving && styles.logDisabled]}
              onPress={handleLog}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.logText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    backgroundColor: Colors.inset,
    borderWidth: 1,
    borderColor: `${Colors.ctaStart}55`,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cardOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: Colors.highlight,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBlock: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  statSuggested: {
    color: Colors.ctaStart,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "600",
  },
  statReps: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.accent,
  },
  statDelta: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.ctaStart,
  },
  statEmpty: {
    color: Colors.textMuted,
    fontSize: 20,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.highlight,
    marginHorizontal: 12,
  },
  chevron: {
    marginLeft: 4,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  savedText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  panel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: `${Colors.ctaStart}55`,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  panelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  panelHint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  panelExercise: {
    color: Colors.accent,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: `${Colors.ctaStart}22`,
    borderWidth: 1,
    borderColor: `${Colors.ctaStart}88`,
  },
  quickChipText: {
    color: Colors.ctaStart,
    fontSize: 12,
    fontWeight: "700",
  },
  quickChipMuted: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.inset,
  },
  quickChipMutedText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  inputs: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  times: {
    color: Colors.textMuted,
    fontSize: 20,
    fontWeight: "700",
    paddingBottom: 10,
  },
  input: {
    backgroundColor: Colors.inset,
    borderRadius: 10,
    borderWidth: 1.5,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  logBtn: {
    backgroundColor: Colors.ctaStart,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  logDisabled: {
    opacity: 0.7,
  },
  logText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
