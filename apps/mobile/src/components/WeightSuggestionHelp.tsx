import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { RaisedCard } from "./RaisedCard";

type Props = {
  size?: number;
  /** Icon sits inline with a label */
  inline?: boolean;
};

/**
 * ? icon → plain-English explainer for suggested weight math.
 */
export function WeightSuggestionHelp({ size = 17, inline = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={inline ? styles.inlineBtn : undefined}
        accessibilityRole="button"
        accessibilityLabel="How we calculate suggested weight"
      >
        <Ionicons
          name="help-circle-outline"
          size={size}
          color={Colors.textMuted}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.cardWrap}
            onPress={(e) => e.stopPropagation()}
          >
            <RaisedCard style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Suggested weight</Text>
                <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </Pressable>
              </View>

              <Text style={styles.lead}>
                We start from your last saved set — not a guess from thin air.
              </Text>

              <View style={styles.step}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepText}>
                  <Text style={styles.bold}>Last set</Text> — e.g. you logged{" "}
                  185 lb × 8 reps.
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepText}>
                  <Text style={styles.bold}>Estimate your max</Text> — math
                  asks: “if 8 reps ≈ 185, what’s a rough one-rep max?” (Epley
                  formula).
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNum}>3</Text>
                <Text style={styles.stepText}>
                  <Text style={styles.bold}>Work backward</Text> — pick a
                  sensible working weight from that max, add a small bump (~2.5%),
                  and round to <Text style={styles.bold}>5 lb</Text> plates.
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNum}>4</Text>
                <Text style={styles.stepText}>
                  <Text style={styles.bold}>At least +5 lb</Text> — we never
                  suggest less than 5 lb above your last weight, so the nudge
                  always feels real.
                </Text>
              </View>

              <Text style={styles.footer}>
                No reps logged? We just add ~2.5% (min +5 lb). Log reps for a
                smarter bump.
              </Text>
            </RaisedCard>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inlineBtn: {
    marginLeft: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 24,
  },
  cardWrap: {
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  lead: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  step: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${Colors.ctaStart}33`,
    color: Colors.ctaStart,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
    overflow: "hidden",
  },
  stepText: {
    flex: 1,
    color: "#ddd",
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    color: "#fff",
    fontWeight: "700",
  },
  footer: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    fontStyle: "italic",
  },
});
