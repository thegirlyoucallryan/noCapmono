import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { clearLegacySharedLocalData } from "./workoutStore";

const LEGAL_LOCAL_KEY = "@nocap/legal_acceptance";
const PENDING_LEGAL_KEY = "@nocap/pending_legal_accept";
const SPOTIFY_TOKEN_KEY = "@nocap/spotify_tokens";
const SPOTIFY_VIBE_KEY = "@nocap/spotify_vibe";
const PLAY_LAYOUT_KEY = "@nocap/play_layout_mode";

const USER_SCOPED_LEAVES = [
  "saved_workouts",
  "exercise_logs",
  "last_session",
  "session_history",
  "current_workout",
  "active_play",
] as const;

function userScopedKey(userId: string, leaf: string) {
  return `@nocap/u:${userId}/${leaf}`;
}

/** Wipe device caches tied to this account (and shared legacy keys). */
export async function clearAccountLocalData(userId: string | null) {
  const keys = [
    LEGAL_LOCAL_KEY,
    PENDING_LEGAL_KEY,
    SPOTIFY_TOKEN_KEY,
    SPOTIFY_VIBE_KEY,
    PLAY_LAYOUT_KEY,
  ];
  if (userId) {
    for (const leaf of USER_SCOPED_LEAVES) {
      keys.push(userScopedKey(userId, leaf));
    }
  }
  await AsyncStorage.multiRemove(keys);
  await clearLegacySharedLocalData();
}

/**
 * Permanently delete the signed-in auth user (cloud + cascaded rows).
 * Caller should clear local state and signOut after success.
 */
export async function deleteAccount() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not signed in");
  }

  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
  });

  if (error) {
    throw new Error(error.message || "Account deletion failed");
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  return data;
}
