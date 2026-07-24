import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { GradientCTA } from "../components/GradientCTA";
import { TERMS_VERSION, PRIVACY_VERSION } from "../constants/Legal";
import { acceptLegal } from "../../utils/workoutApi";
import { supabase } from "../../utils/supabase";
import type { LegalStackParamList } from "./TermsAndConditionsScreen";

type Props = {
  onAccepted: () => void;
};

/** Shown when signed in but Terms version missing / outdated */
export function AcceptLegalScreen({ onAccepted }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<LegalStackParamList>>();

  const onContinue = async () => {
    if (!agreed) {
      Alert.alert("Agree first", "Please accept the Terms & Privacy Policy.");
      return;
    }
    setSaving(true);
    try {
      await acceptLegal();
      onAccepted();
    } catch (e: any) {
      Alert.alert("Couldn’t save", e?.message ?? "Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.4} />
      </View>
      <Text style={styles.title}>Almost there</Text>
      <Text style={styles.sub}>
        Please accept the latest Terms & Privacy to use No-Cap.
      </Text>

      <Pressable
        onPress={() => setAgreed((v) => !v)}
        style={styles.checkRow}
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
          .
        </Text>
      </Pressable>
      <Text style={styles.version}>
        Docs v{TERMS_VERSION} / {PRIVACY_VERSION}
      </Text>

      {saving ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 24 }} />
      ) : (
        <GradientCTA
          title="Continue"
          icon="checkmark"
          disabled={!agreed}
          onPress={onContinue}
          style={{ marginTop: 24, alignSelf: "stretch" }}
        />
      )}

      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
    padding: 24,
    paddingTop: 80,
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: 36,
    color: Colors.accent,
    letterSpacing: 1,
  },
  sub: {
    color: Colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
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
  version: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
  signOut: {
    marginTop: 28,
    alignSelf: "center",
  },
  signOutText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
