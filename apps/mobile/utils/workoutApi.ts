import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { TERMS_VERSION, PRIVACY_VERSION } from "../src/constants/Legal";
import { Exercise } from "../src/types/types";

const LEGAL_LOCAL_KEY = "@nocap/legal_acceptance";

export type SavedWorkout = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  exercises?: SavedWorkoutExercise[];
};

export type SavedWorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name: string;
  body_part: string | null;
  equipment: string | null;
  sort_order: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight?: number | null;
};

export type ExerciseLog = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  performed_at: string;
};

type LocalLegal = {
  userId: string;
  terms_version: string;
  privacy_version: string;
  accepted_at: string;
};

async function saveLocalLegal(userId: string, at: string) {
  const payload: LocalLegal = {
    userId,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    accepted_at: at,
  };
  await AsyncStorage.setItem(LEGAL_LOCAL_KEY, JSON.stringify(payload));
}

async function readLocalLegal(userId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(LEGAL_LOCAL_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as LocalLegal;
    return (
      data.userId === userId &&
      data.terms_version === TERMS_VERSION &&
      data.privacy_version === PRIVACY_VERSION
    );
  } catch {
    return false;
  }
}

const PENDING_LEGAL_KEY = "@nocap/pending_legal_accept";

/** Call when user checked the box and is about to sign in */
export async function markLegalPending() {
  await AsyncStorage.setItem(PENDING_LEGAL_KEY, "1");
}

export async function clearLegalPending() {
  await AsyncStorage.removeItem(PENDING_LEGAL_KEY);
}

async function consumeLegalPending(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PENDING_LEGAL_KEY);
  if (v !== "1") return false;
  await AsyncStorage.removeItem(PENDING_LEGAL_KEY);
  return true;
}

/**
 * If the SignIn checkbox was checked, persist acceptance now that we have a user.
 * Safe to call on every auth session restore.
 */
export async function ensureLegalAfterSignIn() {
  const pending = await consumeLegalPending();
  if (!pending) return;
  await acceptLegal();
}

/** Persist Terms + Privacy acceptance (cloud + local backup) */
export async function acceptLegal(opts?: { displayName?: string }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const now = new Date().toISOString();
  const displayName =
    opts?.displayName?.trim() ||
    (user.user_metadata?.display_name as string | undefined) ||
    (user.user_metadata?.username as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    null;

  const row: Record<string, unknown> = {
    id: user.id,
    terms_accepted_at: now,
    privacy_accepted_at: now,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    updated_at: now,
  };
  if (displayName) row.display_name = displayName;

  const { error } = await supabase.from("profiles").upsert(row);

  await saveLocalLegal(user.id, now);

  if (error) {
    console.warn("Cloud legal save failed, kept local:", error.message);
  }
}

/** Username / display name for greetings */
export async function getDisplayName(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.display_name?.trim()) return data.display_name.trim();
  } catch {
    /* fall through */
  }

  const meta = user.user_metadata ?? {};
  return (
    meta.display_name ||
    meta.username ||
    meta.full_name ||
    meta.given_name ||
    (user.email ? user.email.split("@")[0] : null) ||
    null
  );
}

export async function setDisplayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Username required");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await supabase.auth.updateUser({
    data: { display_name: trimmed, username: trimmed },
  });
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: trimmed,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function hasAcceptedLegal(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "terms_accepted_at, privacy_accepted_at, terms_version, privacy_version"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      const ok =
        !!data.terms_accepted_at &&
        !!data.privacy_accepted_at &&
        data.terms_version === TERMS_VERSION &&
        data.privacy_version === PRIVACY_VERSION;
      if (ok) return true;
    }
  } catch (e) {
    console.warn("Legal check failed:", e);
  }

  return readLocalLegal(user.id);
}

export async function listWorkouts(): Promise<SavedWorkout[]> {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWorkout(workoutId: string): Promise<SavedWorkout | null> {
  const { data: workout, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .maybeSingle();
  if (error) throw error;
  if (!workout) return null;

  const { data: exercises, error: exError } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_id", workoutId)
    .order("sort_order", { ascending: true });
  if (exError) throw exError;

  return { ...workout, exercises: exercises ?? [] };
}

export async function saveWorkout(
  name: string,
  exercises: Exercise[]
): Promise<SavedWorkout> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, name })
    .select("*")
    .single();
  if (error) throw error;

  if (exercises.length) {
    const rows = exercises.map((ex, index) => ({
      workout_id: workout.id,
      exercise_id: ex.id,
      exercise_name: ex.name,
      body_part: ex.bodyPart ?? null,
      equipment: ex.equipment ?? null,
      sort_order: index,
      target_reps: ex.targetReps ?? null,
      target_weight: ex.targetWeight ?? null,
    }));
    const { error: exError } = await supabase
      .from("workout_exercises")
      .insert(rows);
    if (exError) {
      // Older DBs may lack target_weight — retry without it.
      const fallback = rows.map(({ target_weight: _tw, ...rest }) => rest);
      const { error: retryError } = await supabase
        .from("workout_exercises")
        .insert(fallback);
      if (retryError) throw retryError;
    }
  }

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
  if (error) throw error;
}

export async function logExercise(input: {
  exerciseId: string;
  exerciseName: string;
  weight?: number;
  reps?: number;
  sets?: number;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("exercise_logs")
    .insert({
      user_id: user.id,
      exercise_id: input.exerciseId,
      exercise_name: input.exerciseName,
      weight: input.weight ?? null,
      reps: input.reps ?? null,
      sets: input.sets ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ExerciseLog;
}

/** Most recent log for an exercise (last weight / reps) */
export async function getLastLog(
  exerciseId: string
): Promise<ExerciseLog | null> {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("exercise_id", exerciseId)
    .order("performed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Heaviest weight logged for an exercise */
export async function getMaxWeight(
  exerciseId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("weight")
    .eq("exercise_id", exerciseId)
    .not("weight", "is", null)
    .order("weight", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.weight ?? null;
}
