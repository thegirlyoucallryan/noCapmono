import { useState } from "react";
import {
  ScrollView,
  Image,
  View,
  Text,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors";
import SignInWithGoogle from "../components/SignInWithGoogle";
import logo from "../assets/icon.png";
import { SignInWithApple } from "../components/SigninWApple";
import { Ionicons } from "@expo/vector-icons";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { TERMS_VERSION, PRIVACY_VERSION } from "../constants/Legal";
import { EmailPasswordAuth } from "../components/EmailPasswordAuth";
import type { LegalStackParamList } from "./TermsAndConditionsScreen";

export function SignIn() {
  const [agreed, setAgreed] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<LegalStackParamList>>();

  return (
    <View style={styles.screen}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.45} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWell}>
          <Image source={logo} style={styles.logo} />
        </View>
        <Text style={styles.brand}>No-Cap</Text>
        <Text style={styles.tagline}>
          Build it. Play it. Stack your stats.
        </Text>

        <View style={styles.legalBox}>
          <Pressable
            onPress={() => setAgreed((v) => !v)}
            style={styles.checkRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed ? (
                <Ionicons name="checkmark" size={16} color={Colors.twentyThree} />
              ) : null}
            </View>
            <Text style={styles.legalText}>
              I agree to the{" "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("TermsAndConditions")}
              >
                Terms
              </Text>
              {" & "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("PrivacyPolicy")}
              >
                Privacy Policy
              </Text>
              , including the liability waiver.
            </Text>
          </Pressable>
          <Text style={styles.versionHint}>
            Docs v{TERMS_VERSION} / {PRIVACY_VERSION}
          </Text>
        </View>

        {!agreed ? (
          <Text style={styles.gateHint}>
            Check the box above to enable sign-in.
          </Text>
        ) : null}

        <EmailPasswordAuth disabled={!agreed} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={[styles.authButtons, !agreed && styles.authDisabled]}>
          {Platform.OS === "android" && (
            <SignInWithGoogle disabled={!agreed} requireAgreement />
          )}
          <SignInWithApple disabled={!agreed} requireAgreement />
        </View>
      </ScrollView>
    </View>
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
    height: 320,
  },
  content: {
    padding: 24,
    paddingTop: 56,
    alignItems: "center",
  },
  logoWell: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.inset,
    borderWidth: 2,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
  },
  brand: {
    fontFamily: DISPLAY_FONT,
    fontSize: 42,
    color: "#fff",
    letterSpacing: 1.5,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  legalBox: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  legalText: {
    flex: 1,
    color: "#ddd",
    fontSize: 14,
    lineHeight: 21,
  },
  link: {
    color: Colors.accent,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  versionHint: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
  gateHint: {
    color: Colors.ctaStart,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.highlight,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  authButtons: {
    alignItems: "center",
    gap: 12,
    marginTop: 0,
    width: "100%",
    paddingBottom: 40,
  },
  authDisabled: {
    opacity: 0.45,
  },
});
