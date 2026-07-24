import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import logo from "../assets/icon.png";

export function BuildHero() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <LinearGradient
          colors={[Colors.surface, Colors.nmphEdge, Colors.twentyThree]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(255, 107, 53, 0.12)",
            "rgba(0, 212, 255, 0.05)",
            "transparent",
          ]}
          locations={[0, 0.4, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.85 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.logoWell}>
              <Image source={logo} style={styles.logo} resizeMode="cover" />
            </View>

            <View style={styles.titleBlock}>
              <View style={styles.badge}>
                <Ionicons
                  name="hammer-outline"
                  size={12}
                  color={Colors.glowCyan}
                />
                <Text style={styles.badgeText}>Workout builder</Text>
              </View>
              <Text style={styles.title}>Build</Text>
              <Text style={styles.subtitle}>
                Mix search, body parts & equipment — build it your way.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 0,
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111114",
    borderWidth: 2,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: Colors.glowCyanDim,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.28)",
    marginBottom: 6,
  },
  badgeText: {
    color: Colors.glowCyan,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: 36,
    color: "#fff",
    letterSpacing: 1.2,
    lineHeight: 38,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
