import { useState } from "react";
import {
  ScrollView,
  Image,
  View,
  Text,
  Platform,
  StyleSheet,
} from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors";
import SignInWithGoogle from "../components/SignInWithGoogle";
import logo from "../assets/icon.png";
import { SignInWithApple } from "../components/SigninWApple";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { EmailPasswordAuth } from "../components/EmailPasswordAuth";
import type { LegalStackParamList } from "./TermsAndConditionsScreen";

export function SignIn() {
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
          <Image source={logo} style={styles.logo} resizeMode="cover" />
        </View>
        <Text style={styles.brand}>No-Cap</Text>
        <Text style={styles.tagline}>
          Build it. Play it. Stack your stats.
        </Text>

        <EmailPasswordAuth
          onOpenTerms={() => navigation.navigate("TermsAndConditions")}
          onOpenPrivacy={() => navigation.navigate("PrivacyPolicy")}
        />

        <Text style={styles.signinLegalHint}>
          Apple / Google: first-time sign-in asks you to accept Terms once.
          Returning sign-in goes straight in.
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.authButtons}>
          {Platform.OS === "android" && <SignInWithGoogle />}
          <SignInWithApple />
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
    width: "100%",
    height: "100%",
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
  signinLegalHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
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
});
