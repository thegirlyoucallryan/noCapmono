import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../../utils/supabase";
import { acceptLegal, markLegalPending } from "../../utils/workoutApi";
import { Alert, Pressable, Text, StyleSheet } from "react-native";
import NeomorphicStyles from "../constants/NeomorphicStyles";
import Colors from "../constants/Colors";

type Props = {
  disabled?: boolean;
  requireAgreement?: boolean;
};

function SignInWithGoogle({ disabled = false }: Props) {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "367662196638-9b1tk214mtjscshp14ljaljnaftfb5vs.apps.googleusercontent.com",
  });

  const onPress = async () => {
    if (disabled) {
      Alert.alert(
        "Agree first",
        "Please accept the Terms & Privacy Policy to continue."
      );
      return;
    }

    try {
      await markLegalPending();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type !== "success") {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error("no ID token present!");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error?.message === "Bad ID token") {
        await GoogleSignin.clearCachedAccessToken(idToken);
        const { idToken: refreshedToken } = await GoogleSignin.getTokens();
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: refreshedToken,
        });
      } else if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }

      try {
        await acceptLegal();
      } catch (e: any) {
        console.warn("Legal accept after Google sign-in:", e?.message);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Play Services", "Google Play Services not available.");
        return;
      }
      Alert.alert(
        "Sign in failed",
        error?.message ?? "Something went wrong with Google Sign In."
      );
    }
  };

  if (disabled) {
    return (
      <Pressable onPress={onPress} style={styles.disabledWrap}>
        <Text style={styles.disabledText}>Sign in with Google</Text>
      </Pressable>
    );
  }

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Standard}
      color={GoogleSigninButton.Color.Dark}
      style={{ ...NeomorphicStyles, padding: 0, margin: 0 }}
      onPress={onPress}
    />
  );
}

export default SignInWithGoogle;

const styles = StyleSheet.create({
  disabledWrap: {
    width: 220,
    height: 48,
    borderRadius: 5,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledText: {
    color: Colors.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
});
