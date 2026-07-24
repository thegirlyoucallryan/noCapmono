import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { RaisedCard } from "./RaisedCard";
import { ProgressionChart } from "./ProgressionChart";
import {
  getExerciseHistory,
  getLastLift,
  suggestNextFromLast,
} from "../../utils/workoutStore";
import { WeightSuggestionHelp } from "./WeightSuggestionHelp";
import { exerciseUsesWeight } from "../../utils/exerciseWeight";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startToday.getTime() - startThat.getTime()) / 86400000
  );
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function shortDay(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
  });
}

type Props = {
  exerciseId: string;
  bodyPart?: string | null;
  equipment?: string | null;
  exerciseName?: string | null;
};

/**
 * Last lift + climb chart + suggested weight bump for exercise detail.
 */
export function ExerciseProgressCard({
  exerciseId,
  bodyPart,
  equipment,
  exerciseName,
}: Props) {
  const [points, setPoints] = useState<
    { value: number; label?: string }[]
  >([]);
  const [lastLine, setLastLine] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    next: number;
    delta: number;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    (async () => {
      try {
        const [history, last] = await Promise.all([
          getExerciseHistory(exerciseId, 8),
          getLastLift(exerciseId),
        ]);
        if (!alive) return;
        setPoints(
          history.map((h) => ({
            value: h.weight,
            label: shortDay(h.at),
          }))
        );
        if (last?.weight != null) {
          const w = Number(last.weight);
          const reps = last.reps != null ? ` × ${last.reps}` : "";
          setLastLine(`${w} lb${reps} · ${formatWhen(last.performed_at)}`);
          const next = suggestNextFromLast(w, last.reps);
          setSuggestion(next > w ? { next, delta: next - w } : null);
        } else {
          setLastLine(null);
          setSuggestion(null);
        }
      } catch {
        if (alive) {
          setPoints([]);
          setLastLine(null);
          setSuggestion(null);
        }
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [exerciseId]);

  if (!exerciseUsesWeight({ bodyPart, equipment, name: exerciseName })) {
    return null;
  }

  if (!loaded) return null;

  if (!points.length && !lastLine) {
    return (
      <RaisedCard style={styles.card}>
        <Text style={styles.title}>Your lifts</Text>
        <Text style={styles.empty}>
          Log weight on Play — last set, climb, and a suggested bump show up
          here.
        </Text>
      </RaisedCard>
    );
  }

  return (
    <RaisedCard style={styles.card}>
      <Text style={styles.title}>Your lifts</Text>
      {lastLine ? (
        <Text style={styles.last}>
          Last <Text style={styles.lastValue}>{lastLine}</Text>
        </Text>
      ) : null}

      {suggestion ? (
        <View style={styles.suggestRow}>
          <Ionicons name="trending-up" size={16} color={Colors.ctaStart} />
          <Text style={styles.suggestText}>
            Next session try{" "}
            <Text style={styles.suggestValue}>{suggestion.next} lb</Text>
            <Text style={styles.suggestDelta}> (+{suggestion.delta})</Text>
          </Text>
          <WeightSuggestionHelp size={16} inline />
        </View>
      ) : null}

      {points.length > 0 ? (
        <View style={styles.chart}>
          <ProgressionChart
            points={points}
            compact
            height={88}
            tone="heat"
            unit="lb"
            emptyHint=""
          />
        </View>
      ) : null}
    </RaisedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginTop: 16,
  },
  title: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  last: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  lastValue: {
    color: Colors.accent,
    fontWeight: "700",
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.inset,
    borderWidth: 1,
    borderColor: `${Colors.ctaStart}66`,
  },
  suggestText: {
    color: "#ddd",
    fontSize: 14,
    flex: 1,
    flexShrink: 1,
  },
  suggestValue: {
    color: Colors.ctaStart,
    fontWeight: "800",
  },
  suggestDelta: {
    color: Colors.ctaStart,
    fontWeight: "600",
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  chart: {
    marginTop: 4,
  },
});
