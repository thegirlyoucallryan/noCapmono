import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { RaisedCard } from "../components/RaisedCard";
import {
  estimateOneRepMax,
  suggestNextWeight,
} from "../../utils/workoutStore";
import { PedometerScreen } from "./Pedometer";

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/**
 * Tools — steps, 1RM estimator, and BMI calculator.
 */
export function CalculatorScreen() {
  const [liftWeight, setLiftWeight] = useState("");
  const [reps, setReps] = useState("5");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [bodyWeight, setBodyWeight] = useState("");

  const result = useMemo(() => {
    const w = parseFloat(liftWeight);
    const r = parseInt(reps, 10);
    if (!w || !r || w <= 0 || r <= 0) return null;
    const oneRm = estimateOneRepMax(w, r);
    const next = suggestNextWeight(oneRm, r);
    const bump = Math.max(0, next - w);
    return {
      oneRm: Math.round(oneRm),
      next,
      bump,
    };
  }, [liftWeight, reps]);

  const bmiResult = useMemo(() => {
    const ft = parseInt(heightFt, 10);
    const inchesPart = parseFloat(heightIn) || 0;
    const lb = parseFloat(bodyWeight);
    if (!Number.isFinite(ft) || ft <= 0 || !lb || lb <= 0) return null;
    if (inchesPart < 0 || inchesPart >= 12) return null;
    const totalIn = ft * 12 + inchesPart;
    if (totalIn <= 0) return null;
    const bmi = (703 * lb) / (totalIn * totalIn);
    if (!Number.isFinite(bmi)) return null;
    return {
      bmi: Math.round(bmi * 10) / 10,
      category: bmiCategory(bmi),
    };
  }, [heightFt, heightIn, bodyWeight]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.3} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Tools</Text>
        <Text style={styles.sub}>
          Steps, lift math, and a quick BMI estimate — all on-device.
        </Text>

        <Text style={styles.sectionTitle}>Steps</Text>
        <RaisedCard style={styles.stepsCard}>
          <PedometerScreen />
        </RaisedCard>

        <RaisedCard style={styles.card}>
          <Text style={styles.cardTitle}>1RM estimator</Text>
          <Text style={styles.cardHint}>
            What you lifted × how many reps → estimated one-rep max.
          </Text>

          <View style={styles.inputs}>
            <View style={styles.field}>
              <Text style={styles.label}>Weight (lb)</Text>
              <TextInput
                style={styles.input}
                value={liftWeight}
                onChangeText={setLiftWeight}
                keyboardType="decimal-pad"
                placeholder="185"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {result ? (
            <View style={styles.results}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Est. max</Text>
                <Text style={styles.statValue}>{result.oneRm}</Text>
                <Text style={styles.statUnit}>lb</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Try next</Text>
                <Text style={[styles.statValue, styles.statOrange]}>
                  {result.next}
                </Text>
                <Text style={styles.statUnit}>
                  lb{result.bump > 0 ? ` (+${result.bump})` : ""}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>
              Enter a working set to see your estimated max.
            </Text>
          )}
        </RaisedCard>

        <RaisedCard style={styles.card}>
          <Text style={styles.cardTitle}>BMI calculator</Text>
          <Text style={styles.cardHint}>
            Height and body weight → BMI. Estimate only — not medical advice.
          </Text>

          <View style={styles.inputs}>
            <View style={styles.field}>
              <Text style={styles.label}>Height (ft)</Text>
              <TextInput
                style={styles.input}
                value={heightFt}
                onChangeText={setHeightFt}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Height (in)</Text>
              <TextInput
                style={styles.input}
                value={heightIn}
                onChangeText={setHeightIn}
                keyboardType="decimal-pad"
                placeholder="10"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Weight (lb)</Text>
              <TextInput
                style={styles.input}
                value={bodyWeight}
                onChangeText={setBodyWeight}
                keyboardType="decimal-pad"
                placeholder="170"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {bmiResult ? (
            <View style={styles.results}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>BMI</Text>
                <Text style={styles.statValue}>{bmiResult.bmi}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Category</Text>
                <Text style={[styles.statValue, styles.statCategory]}>
                  {bmiResult.category}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>
              Enter height and weight to see BMI.
            </Text>
          )}
        </RaisedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  header: {
    fontFamily: DISPLAY_FONT,
    fontSize: 34,
    color: Colors.accent,
    letterSpacing: 1.2,
  },
  sub: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    marginTop: 4,
  },
  card: {
    padding: 18,
    marginBottom: 22,
  },
  cardTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 24,
    color: "#fff",
    letterSpacing: 0.6,
  },
  cardHint: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputs: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.inset,
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  results: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.highlight,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 56,
    backgroundColor: Colors.highlight,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: DISPLAY_FONT,
    fontSize: 40,
    color: Colors.accent,
    lineHeight: 44,
    marginTop: 4,
  },
  statCategory: {
    fontSize: 22,
    lineHeight: 28,
    color: Colors.ctaStart,
    textAlign: "center",
  },
  statOrange: {
    color: Colors.ctaStart,
  },
  statUnit: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  placeholder: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  stepsCard: {
    padding: 12,
    marginBottom: 22,
  },
});
