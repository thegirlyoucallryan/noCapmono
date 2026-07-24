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
import Colors from "../constants/Colors";
import { supabase } from "../../utils/supabase";
import {
  acceptLegal,
  markLegalPending,
} from "../../utils/workoutApi";

type Props = {
  disabled?: boolean;
};

type Mode = "signin" | "signup";

export function EmailPasswordAuth({ disabled = false }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const requireAgreed = () => {
    if (disabled) {
      Alert.alert(
        "Agree first",
        "Please accept the Terms & Privacy Policy to continue."
      );
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!requireAgreed()) return;

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
      await markLegalPending();

      if (mode === "signup") {
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
          setMode("signin");
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: e,
        password: p,
      });
      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }
      if (data.session) {
        await acceptLegal();
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
    <View style={[styles.wrap, disabled && styles.dimmed]}>
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setMode("signin")}
          style={[styles.tab, mode === "signin" && styles.tabOn]}
        >
          <Text style={[styles.tabText, mode === "signin" && styles.tabTextOn]}>
            Sign in
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("signup")}
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
          editable={!disabled && !busy}
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
        editable={!disabled && !busy}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={Colors.textMuted}
        secureTextEntry
        editable={!disabled && !busy}
      />

      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => [
          styles.submit,
          (disabled || busy) && styles.submitDisabled,
          pressed && !disabled && !busy && styles.pressed,
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
  dimmed: {
    opacity: 0.45,
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
