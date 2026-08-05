import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { supabase } from "../../utils/supabase";
import { acceptLegal, markLegalPending } from "../../utils/workoutApi";
import { TERMS_VERSION, PRIVACY_VERSION } from "../constants/Legal";

type Mode = "signin" | "signup";

type Props = {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
};

export function EmailPasswordAuth({ onOpenTerms, onOpenPrivacy }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [agreed, setAgreed] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    if (next === "signin") setAgreed(false);
  };

  const onSubmit = async () => {
    if (mode === "signup" && !agreed) {
      Alert.alert(
        "Agree first",
        "Please accept the Terms & Privacy Policy to create an account."
      );
      return;
    }

    const e = email.trim().toLowerCase();
    const p = password;
    const u = username.trim();

    if (!e || !p) {
      Alert.alert("Missing info", "Email and password are required.");
      return;
    }
    if (p.length < 6) {
      Alert.alert("Password", "Use at least 6 characters.");
      return;
    }
    if (mode === "signup" && !u) {
      Alert.alert("Username", "Pick a username to show on Home.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        await markLegalPending();
        const { data, error } = await supabase.auth.signUp({
          email: e,
          password: p,
          options: {
            data: {
              display_name: u,
              username: u,
              full_name: u,
            },
            emailRedirectTo: "nocap://auth/callback",
          },
        });
        if (error) {
          Alert.alert("Sign up failed", error.message);
          return;
        }

        if (data.session) {
          await acceptLegal({ displayName: u });
        } else {
          Alert.alert(
            "Confirm your email",
            "Open the link in the email (ignore any localhost error — your account is still confirmed). Then come back here and tap Sign in."
          );
          switchMode("signin");
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: e,
        password: p,
      });
      if (error) {
        Alert.alert("Sign in failed", error.message);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    const e = email.trim().toLowerCase();
    if (!e) {
      Alert.alert("Email", "Enter your email first, then tap Forgot password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(e);
    if (error) {
      Alert.alert("Reset failed", error.message);
      return;
    }
    Alert.alert("Email sent", "Check your inbox for a reset link.");
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        <Pressable
          onPress={() => switchMode("signin")}
          style={[styles.tab, mode === "signin" && styles.tabOn]}
        >
          <Text style={[styles.tabText, mode === "signin" && styles.tabTextOn]}>
            Sign in
          </Text>
        </Pressable>
        <Pressable
          onPress={() => switchMode("signup")}
          style={[styles.tab, mode === "signup" && styles.tabOn]}
        >
          <Text style={[styles.tabText, mode === "signup" && styles.tabTextOn]}>
            Create account
          </Text>
        </Pressable>
      </View>

      {mode === "signup" ? (
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
      ) : null}

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={Colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!busy}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={Colors.textMuted}
        secureTextEntry
        editable={!busy}
      />

      {mode === "signup" ? (
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
              <Text style={styles.link} onPress={onOpenTerms}>
                Terms
              </Text>
              {" & "}
              <Text style={styles.link} onPress={onOpenPrivacy}>
                Privacy Policy
              </Text>
              , including the liability waiver.
            </Text>
          </Pressable>
          <Text style={styles.versionHint}>
            Docs v{TERMS_VERSION} / {PRIVACY_VERSION}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={onSubmit}
        disabled={busy || (mode === "signup" && !agreed)}
        style={({ pressed }) => [
          styles.submit,
          (busy || (mode === "signup" && !agreed)) && styles.submitDisabled,
          pressed &&
            !busy &&
            !(mode === "signup" && !agreed) &&
            styles.pressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={Colors.twentyThree} />
        ) : (
          <Text style={styles.submitText}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </Text>
        )}
      </Pressable>

      {mode === "signin" ? (
        <Pressable onPress={onForgot} hitSlop={8} style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>
          Username shows on Home — e.g. “Good morning, Hartley”
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: Colors.inset,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabOn: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    color: Colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextOn: {
    color: Colors.accent,
  },
  input: {
    backgroundColor: Colors.inset,
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 10,
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
  submit: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    color: Colors.twentyThree,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  forgot: {
    alignSelf: "center",
    marginTop: 12,
  },
  forgotText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 17,
  },
});
