import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { RaisedCard } from "./RaisedCard";

export function ToolTip({ close }: { close: () => void }) {
  return (
    <View style={styles.overlay}>
      <RaisedCard style={styles.card}>
        <Pressable onPress={close} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.textMuted} />
        </Pressable>

        <View style={styles.section}>
          <Ionicons name="repeat" size={20} color={Colors.accent} />
          <View style={styles.sectionText}>
            <Text style={styles.title}>Circuit</Text>
            <Text style={styles.body}>
              Do one set of each exercise, then repeat for all rounds. Great for
              full-body sessions.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Ionicons name="list" size={20} color={Colors.accent} />
          <View style={styles.sectionText}>
            <Text style={styles.title}>Straight Set</Text>
            <Text style={styles.body}>
              Complete all sets of one exercise before moving to the next. Best
              when you want to focus on one muscle group.
            </Text>
          </View>
        </View>
      </RaisedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    zIndex: 55,
    padding: 24,
  },
  card: {
    padding: 20,
    gap: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  section: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  sectionText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    color: Colors.accent,
    fontWeight: "600",
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 21,
  },
});
