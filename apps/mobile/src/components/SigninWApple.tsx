import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../../utils/supabase";
import Colors from "../constants/Colors";

function formatAuthError(error: any): string {
  if (!error) return "Unknown error";
  const parts = [
    error.message,
    error.error_description,
    error.code ? `code: ${error.code}` : null,
    error.status ? `status: ${error.status}` : null,
  ].filter(Boolean);
  return parts.join("\n") || JSON.stringify(error);
}

/**
 * Native Apple Sign-In (Expo). Matches Supabase Expo docs — no nonce.
 * Requires: Simulator signed into iCloud, or a real device.
 */
export function SignInWithApple() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync().then(setAvailable);
  }, []);

  if (Platform.OS !== "ios") {
    return null;
  }

  const onPress = async () => {
    if (!available) {
      Alert.alert(
        "Apple Sign-In unavailable",
        "Sign into iCloud in Settings on the Simulator, or use a real iPhone. Email sign-in always works."
      );
      return;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple did not return an identity token.");
      }

      console.log("[apple] got identity token, exchanging with supabase…");

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        console.error("[apple] supabase error", error);
        Alert.alert(
          "Sign in failed",
          `${formatAuthError(error)}\n\nCheck Supabase Apple Client IDs includes: com.no.cap.fitness.app`
        );
        return;
      }

      if (!data.session) {
        Alert.alert(
          "Sign in failed",
          "No session returned. Add com.no.cap.fitness.app to Supabase → Auth → Apple → Client IDs."
        );
        return;
      }

      console.log("[apple] signed in as", data.user?.id);

      if (credential.fullName) {
        const nameParts = [
          credential.fullName.givenName,
          credential.fullName.middleName,
          credential.fullName.familyName,
        ].filter(Boolean);

        if (nameParts.length > 0) {
          const fullName = nameParts.join(" ");
          await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              display_name: credential.fullName.givenName || fullName,
              given_name: credential.fullName.givenName,
              family_name: credential.fullName.familyName,
            },
          });
        }
      }
      // First-time / outdated legal → AcceptLegalScreen. Returning users skip it.
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }

      console.error("[apple] catch", error);
      const tip =
        error?.message?.includes("unknown reason") ||
        error?.code === "ERR_REQUEST_UNKNOWN"
          ? "\n\nTip: On Simulator, open Settings → Sign in to your iPhone (iCloud). Or test on a real device."
          : "";
      Alert.alert(
        "Sign in failed",
        (formatAuthError(error) || "Apple Sign-In failed.") + tip
      );
    }
  };

  if (!available) {
    return (
      <Pressable onPress={onPress} style={styles.disabledWrap}>
        <Text style={styles.disabledText}>Apple Sign-In unavailable</Text>
      </Pressable>
    );
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 220, height: 60 }}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  disabledWrap: {
    width: 220,
    height: 60,
    borderRadius: 5,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledText: {
    color: Colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
