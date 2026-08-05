import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { supabase } from "../../utils/supabase";
import { Alert } from "react-native";
import NeomorphicStyles from "../constants/NeomorphicStyles";

function SignInWithGoogle() {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "367662196638-9b1tk214mtjscshp14ljaljnaftfb5vs.apps.googleusercontent.com",
  });

  const onPress = async () => {
    try {
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
      }
      // First-time / outdated legal → AcceptLegalScreen. Returning users skip it.
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
