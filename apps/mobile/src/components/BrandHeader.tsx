import { View, Text, Image, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import logo from "../assets/icon.png";

type Props = {
  userName?: string | null;
  subtitle?: string;
};

function welcomeLine(userName?: string | null) {
  const h = new Date().getHours();
  const part =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  if (userName?.trim()) return `${part}, ${userName.trim()}`;
  return `${part} — welcome back`;
}

export function BrandHeader({ userName, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.logoWell}>
          <Image source={logo} style={styles.logo} resizeMode="cover" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.brand}>No-Cap</Text>
          <Text style={styles.welcome}>{welcomeLine(userName)}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoWell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0d0d10",
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontFamily: DISPLAY_FONT,
    fontSize: 36,
    color: "#fff",
    letterSpacing: 1.5,
    lineHeight: 38,
  },
  welcome: {
    color: Colors.glowCyan,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
