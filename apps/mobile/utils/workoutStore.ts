import AsyncStorage from "@react-native-async-storage/async-storage";
import { Exercise } from "../src/types/types";
import { supabase } from "./supabase";
import {
  saveWorkout as cloudSaveWorkout,
  updateWorkout as cloudUpdateWorkout,
  listWorkouts as cloudListWorkouts,
  getWorkout as cloudGetWorkout,
  deleteWorkout as cloudDeleteWorkout,
  logExercise as cloudLogExercise,
  getLastLog as cloudGetLastLog,
  getMaxWeight as cloudGetMaxWeight,
  listWeightedLogs as cloudListWeightedLogs,
  SavedWorkout,
  ExerciseLog,
} from "./workoutApi";

/** Legacy unscoped keys — never read into a new account */
const LEGACY_WORKOUTS_KEY = "@nocap/saved_workouts";
const LEGACY_LOGS_KEY = "@nocap/exercise_logs";
const LEGACY_SESSION_KEY = "@nocap/last_session";
const LEGACY_SESSION_HISTORY_KEY = "@nocap/session_history";

type LocalWorkout = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  exercises: {
    exercise_id: string;
    exercise_name: string;
    body_part: string | null;
    equipment: string | null;
    sort_order: number;
    target_weight?: number | null;
    target_reps?: number | null;
  }[];
};

type LocalLog = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  performed_at: string;
};

async function getSessionUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

function storageKey(userId: string | null, leaf: string) {
  return `@nocap/u:${userId ?? "guest"}/${leaf}`;
}

async function readLocalWorkouts(): Promise<LocalWorkout[]> {
  const userId = await getSessionUserId();
  const raw = await AsyncStorage.getItem(storageKey(userId, "saved_workouts"));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalWorkout[];
  } catch {
    return [];
  }
}

async function writeLocalWorkouts(workouts: LocalWorkout[]) {
  const userId = await getSessionUserId();
  await AsyncStorage.setItem(
    storageKey(userId, "saved_workouts"),
    JSON.stringify(workouts)
  );
}

async function readLocalLogs(): Promise<LocalLog[]> {
  const userId = await getSessionUserId();
  const raw = await AsyncStorage.getItem(storageKey(userId, "exercise_logs"));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalLog[];
  } catch {
    return [];
  }
}

async function writeLocalLogs(logs: LocalLog[]) {
  const userId = await getSessionUserId();
  await AsyncStorage.setItem(
    storageKey(userId, "exercise_logs"),
    JSON.stringify(logs)
  );
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeWorkoutName(name: string) {
  return name.trim().toLowerCase();
}

function mapExercisesToLocal(exercises: Exercise[]) {
  return exercises.map((ex, index) => ({
    exercise_id: ex.id,
    exercise_name: ex.name,
    body_part: ex.bodyPart ?? null,
    equipment: ex.equipment ?? null,
    sort_order: index,
    target_weight: ex.targetWeight ?? null,
    target_reps: ex.targetReps ?? null,
  }));
}

/** True if another saved workout already uses this name (case-insensitive). */
export async function isWorkoutNameTaken(
  name: string,
  excludeId?: string | null
): Promise<boolean> {
  const needle = normalizeWorkoutName(name);
  if (!needle) return false;

  const all = await listSavedWorkouts();
  return all.some(
    (w) =>
      normalizeWorkoutName(w.name) === needle &&
      (!excludeId || w.id !== excludeId)
  );
}

/** Save current queue as a named workout (local always; cloud if signed in) */
export async function saveNamedWorkout(
  name: string,
  exercises: Exercise[]
): Promise<{ id: string; synced: boolean }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name required");
  if (!exercises.length) throw new Error("Add exercises first");
  if (await isWorkoutNameTaken(trimmed)) {
    throw new Error("That name is already used");
  }

  const now = new Date().toISOString();
  const local: LocalWorkout = {
    id: newId(),
    name: trimmed,
    created_at: now,
    updated_at: now,
    exercises: mapExercisesToLocal(exercises),
  };

  const all = await readLocalWorkouts();
  all.unshift(local);
  await writeLocalWorkouts(all);

  let synced = false;
  const userId = await getSessionUserId();
  if (userId) {
    try {
      const cloud = await cloudSaveWorkout(trimmed, exercises);
      const updated = await readLocalWorkouts();
      const idx = updated.findIndex((w) => w.id === local.id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], id: cloud.id };
        await writeLocalWorkouts(updated);
      }
      synced = true;
      return { id: cloud.id, synced };
    } catch (e) {
      console.warn("Cloud save failed, kept local:", e);
    }
  }

  return { id: local.id, synced };
}

/** Overwrite an existing saved workout (local + cloud when signed in). */
export async function updateNamedWorkout(
  workoutId: string,
  name: string,
  exercises: Exercise[]
): Promise<{ id: string; synced: boolean }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name required");
  if (!exercises.length) throw new Error("Add exercises first");
  if (await isWorkoutNameTaken(trimmed, workoutId)) {
    throw new Error("That name is already used");
  }

  const now = new Date().toISOString();
  const all = await readLocalWorkouts();
  const idx = all.findIndex((w) => w.id === workoutId);
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      name: trimmed,
      updated_at: now,
      exercises: mapExercisesToLocal(exercises),
    };
    await writeLocalWorkouts(all);
  } else {
    // Cloud-only id (local cache missing) — keep a local mirror
    all.unshift({
      id: workoutId,
      name: trimmed,
      created_at: now,
      updated_at: now,
      exercises: mapExercisesToLocal(exercises),
    });
    await writeLocalWorkouts(all);
  }

  let synced = false;
  const userId = await getSessionUserId();
  if (userId) {
    try {
      await cloudUpdateWorkout(workoutId, trimmed, exercises);
      synced = true;
    } catch (e) {
      console.warn("Cloud update failed, kept local:", e);
    }
  }

  return { id: workoutId, synced };
}

export async function listSavedWorkouts(): Promise<SavedWorkout[]> {
  const userId = await getSessionUserId();
  if (userId) {
    try {
      return await cloudListWorkouts();
    } catch (e) {
      console.warn("Cloud list failed, using local:", e);
    }
  }

  const local = await readLocalWorkouts();
  return local.map((w) => ({
    id: w.id,
    name: w.name,
    created_at: w.created_at,
    updated_at: w.updated_at,
  }));
}

export async function loadSavedWorkoutExercises(
  workoutId: string
): Promise<Exercise[]> {
  const userId = await getSessionUserId();
  if (userId) {
    try {
      const cloud = await cloudGetWorkout(workoutId);
      if (cloud?.exercises) {
        return cloud.exercises.map((ex) => ({
          id: ex.exercise_id,
          name: ex.exercise_name,
          bodyPart: ex.body_part ?? "",
          equipment: ex.equipment ?? "",
          gifUrl: "",
          target: "",
          targetWeight: (ex as any).target_weight ?? null,
          targetReps: ex.target_reps ?? null,
        }));
      }
    } catch (e) {
      console.warn("Cloud load failed, trying local:", e);
    }
  }

  const local = await readLocalWorkouts();
  const found = local.find((w) => w.id === workoutId);
  if (!found) return [];
  return found.exercises
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ex) => ({
      id: ex.exercise_id,
      name: ex.exercise_name,
      bodyPart: ex.body_part ?? "",
      equipment: ex.equipment ?? "",
      gifUrl: "",
      target: "",
      targetWeight: ex.target_weight ?? null,
      targetReps: ex.target_reps ?? null,
    }));
}

export async function removeSavedWorkout(workoutId: string) {
  const local = await readLocalWorkouts();
  await writeLocalWorkouts(local.filter((w) => w.id !== workoutId));

  const userId = await getSessionUserId();
  if (userId) {
    try {
      await cloudDeleteWorkout(workoutId);
    } catch (e) {
      console.warn("Cloud delete failed:", e);
    }
  }
}

export async function logLift(input: {
  exerciseId: string;
  exerciseName: string;
  weight?: number;
  reps?: number;
  sets?: number;
}): Promise<ExerciseLog> {
  const entry: LocalLog = {
    id: newId(),
    exercise_id: input.exerciseId,
    exercise_name: input.exerciseName,
    weight: input.weight ?? null,
    reps: input.reps ?? null,
    sets: input.sets ?? null,
    performed_at: new Date().toISOString(),
  };

  const logs = await readLocalLogs();
  logs.unshift(entry);
  await writeLocalLogs(logs.slice(0, 500));

  const userId = await getSessionUserId();
  if (userId) {
    try {
      return await cloudLogExercise(input);
    } catch (e) {
      console.warn("Cloud log failed, kept local:", e);
    }
  }

  return {
    id: entry.id,
    exercise_id: entry.exercise_id,
    exercise_name: entry.exercise_name,
    weight: entry.weight,
    reps: entry.reps,
    sets: entry.sets,
    performed_at: entry.performed_at,
  };
}

export async function getLastLift(
  exerciseId: string
): Promise<ExerciseLog | null> {
  const userId = await getSessionUserId();
  if (userId) {
    try {
      const cloud = await cloudGetLastLog(exerciseId);
      if (cloud) return cloud;
    } catch (e) {
      console.warn("Cloud last log failed:", e);
    }
  }

  const logs = await readLocalLogs();
  return logs.find((l) => l.exercise_id === exerciseId) ?? null;
}

export async function getBestWeight(
  exerciseId: string
): Promise<number | null> {
  const userId = await getSessionUserId();
  if (userId) {
    try {
      const cloud = await cloudGetMaxWeight(exerciseId);
      if (cloud != null) return cloud;
    } catch (e) {
      console.warn("Cloud max failed:", e);
    }
  }

  const logs = await readLocalLogs().then((all) =>
    all.filter((l) => l.exercise_id === exerciseId && l.weight != null)
  );
  if (!logs.length) return null;
  return Math.max(...logs.map((l) => Number(l.weight)));
}

export type LastSession = {
  at: string;
  exerciseCount: number;
  sets: number;
  type: string;
  names: string[];
  volumeLoad?: number;
  tensionSeconds?: number;
  /** Rough estimate from work time (+ light volume bump) */
  caloriesEst?: number;
};

export async function recordLastSession(
  session: Omit<LastSession, "at">,
  opts?: { replaceLatest?: boolean }
) {
  const userId = await getSessionUserId();
  const payload: LastSession = {
    ...session,
    at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    storageKey(userId, "last_session"),
    JSON.stringify(payload)
  );

  try {
    const historyKey = storageKey(userId, "session_history");
    const raw = await AsyncStorage.getItem(historyKey);
    const prev: LastSession[] = raw ? JSON.parse(raw) : [];
    if (opts?.replaceLatest && prev.length > 0) {
      // Keep original start time so the session doesn't look brand-new
      payload.at = prev[0].at || payload.at;
      prev[0] = payload;
    } else {
      prev.unshift(payload);
    }
    await AsyncStorage.setItem(historyKey, JSON.stringify(prev.slice(0, 16)));
  } catch {
    /* ignore */
  }

  return payload;
}

async function readScopedOrGuest(leaf: string): Promise<string | null> {
  const userId = await getSessionUserId();
  const scoped = await AsyncStorage.getItem(storageKey(userId, leaf));
  if (scoped) return scoped;
  // Session may have been written before auth resolved (guest key)
  if (userId) {
    const guest = await AsyncStorage.getItem(storageKey(null, leaf));
    if (guest) {
      await AsyncStorage.setItem(storageKey(userId, leaf), guest);
      return guest;
    }
  }
  return null;
}

export async function getLastSession(): Promise<LastSession | null> {
  const raw = await readScopedOrGuest("last_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastSession;
  } catch {
    return null;
  }
}

export async function getSessionHistory(limit = 8): Promise<LastSession[]> {
  const raw = await readScopedOrGuest("session_history");
  if (!raw) {
    const last = await getLastSession();
    return last ? [last] : [];
  }
  try {
    const all = JSON.parse(raw) as LastSession[];
    return all.slice(0, limit);
  } catch {
    return [];
  }
}

/** My Workout queue — survives app kill */
export type PersistedWorkoutExercise = {
  id: string;
  name: string;
  gifUrl?: string;
  equipment?: string;
  bodyPart?: string;
  targetWeight?: number | null;
  targetReps?: number | null;
};

export async function saveCurrentWorkoutQueue(
  exercises: PersistedWorkoutExercise[],
  meta?: {
    sets?: number;
    workoutType?: string;
    name?: string | null;
    workoutId?: string | null;
  }
) {
  const userId = await getSessionUserId();
  await AsyncStorage.setItem(
    storageKey(userId, "current_workout"),
    JSON.stringify({
      exercises,
      sets: meta?.sets ?? 4,
      workoutType: meta?.workoutType ?? "Circuit",
      name: meta?.name ?? null,
      workoutId: meta?.workoutId ?? null,
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function loadCurrentWorkoutQueue(): Promise<{
  exercises: PersistedWorkoutExercise[];
  sets: number;
  workoutType: string;
  name: string | null;
  workoutId: string | null;
} | null> {
  const userId = await getSessionUserId();
  const raw = await AsyncStorage.getItem(storageKey(userId, "current_workout"));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.exercises)) return null;
    return {
      exercises: parsed.exercises,
      sets: typeof parsed.sets === "number" ? parsed.sets : 4,
      workoutType: parsed.workoutType ?? "Circuit",
      name: parsed.name ?? null,
      workoutId: parsed.workoutId ?? null,
    };
  } catch {
    return null;
  }
}

export async function clearCurrentWorkoutQueue() {
  const userId = await getSessionUserId();
  await AsyncStorage.removeItem(storageKey(userId, "current_workout"));
}

/** In-progress Play session — resume after lock/kill */
export type ActivePlaySession = {
  phase: "ready" | "playing" | "rest";
  currentIndex: number;
  timer: number;
  isActive: boolean;
  sessionVolume: number;
  sessionTension: number;
  sets: number;
  type: string;
  favorites: PersistedWorkoutExercise[];
  updatedAt: string;
};

export async function saveActivePlaySession(session: Omit<ActivePlaySession, "updatedAt">) {
  const userId = await getSessionUserId();
  await AsyncStorage.setItem(
    storageKey(userId, "active_play"),
    JSON.stringify({ ...session, updatedAt: new Date().toISOString() })
  );
}

export async function loadActivePlaySession(): Promise<ActivePlaySession | null> {
  const userId = await getSessionUserId();
  const raw = await AsyncStorage.getItem(storageKey(userId, "active_play"));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActivePlaySession;
    if (
      !parsed?.favorites?.length ||
      !["ready", "playing", "rest"].includes(parsed.phase)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearActivePlaySession() {
  const userId = await getSessionUserId();
  await AsyncStorage.removeItem(storageKey(userId, "active_play"));
}

export type LiftMax = {
  exercise_id: string;
  exercise_name: string;
  weight: number;
  performed_at: string;
  previousWeight: number | null;
  delta: number | null;
  history: { weight: number; at: string; reps: number | null }[];
};

export async function getExerciseHistory(
  exerciseId: string,
  limit = 10
): Promise<{ weight: number; at: string; reps: number | null }[]> {
  const logs = await readLocalLogs();
  return logs
    .filter((l) => l.exercise_id === exerciseId && l.weight != null)
    .slice(0, limit)
    .reverse()
    .map((l) => ({
      weight: Number(l.weight),
      at: l.performed_at,
      reps: l.reps,
    }));
}

async function logsForMaxes(): Promise<LocalLog[]> {
  const local = await readLocalLogs();
  const userId = await getSessionUserId();
  if (!userId) return local;

  try {
    const cloud = await cloudListWeightedLogs(400);
    const byId = new Map<string, LocalLog>();
    for (const log of local) {
      byId.set(log.id, log);
    }
    for (const log of cloud) {
      if (log.weight == null) continue;
      byId.set(log.id, {
        id: log.id,
        exercise_id: log.exercise_id,
        exercise_name: log.exercise_name,
        weight: log.weight,
        reps: log.reps,
        sets: log.sets,
        performed_at: log.performed_at,
      });
    }
    const merged = [...byId.values()].sort(
      (a, b) =>
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
    // Keep device cache warm so Home still works offline next time.
    await writeLocalLogs(merged.slice(0, 500));
    return merged;
  } catch (e) {
    console.warn("Cloud maxes sync failed:", e);
    return local;
  }
}

export async function getTopMaxes(limit = 5): Promise<LiftMax[]> {
  const logs = await logsForMaxes();
  const byExercise = new Map<string, LocalLog[]>();

  for (const log of logs) {
    if (log.weight == null) continue;
    const list = byExercise.get(log.exercise_id) ?? [];
    list.push(log);
    byExercise.set(log.exercise_id, list);
  }

  const result: LiftMax[] = [];

  for (const [, list] of byExercise) {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
    const best = sorted.reduce((a, b) =>
      Number(b.weight) > Number(a.weight) ? b : a
    );
    const chronological = [...list]
      .filter((l) => l.weight != null)
      .sort(
        (a, b) =>
          new Date(a.performed_at).getTime() -
          new Date(b.performed_at).getTime()
      );
    const history = chronological.slice(-8).map((l) => ({
      weight: Number(l.weight),
      at: l.performed_at,
      reps: l.reps,
    }));

    const earlier = sorted.filter(
      (l) =>
        l.id !== best.id &&
        new Date(l.performed_at).getTime() <
          new Date(best.performed_at).getTime()
    );
    const previousWeight =
      earlier.length > 0
        ? Math.max(...earlier.map((l) => Number(l.weight)))
        : history.length >= 2
          ? history[history.length - 2].weight
          : null;

    const weight = Number(best.weight);
    result.push({
      exercise_id: best.exercise_id,
      exercise_name: best.exercise_name,
      weight,
      performed_at: best.performed_at,
      previousWeight,
      delta:
        previousWeight != null
          ? Math.round((weight - previousWeight) * 10) / 10
          : null,
      history,
    });
  }

  return result.sort((a, b) => b.weight - a.weight).slice(0, limit);
}

export type HomeSummary = {
  lastSession: LastSession | null;
  savedWorkouts: SavedWorkout[];
  topMaxes: LiftMax[];
  sessionHistory: LastSession[];
};

export async function getHomeSummary(): Promise<HomeSummary> {
  const [lastSession, savedWorkouts, topMaxes, sessionHistory] =
    await Promise.all([
      getLastSession(),
      listSavedWorkouts(),
      getTopMaxes(5),
      getSessionHistory(8),
    ]);
  return { lastSession, savedWorkouts, topMaxes, sessionHistory };
}

/** Drop legacy device-wide cache so it can't leak across accounts. */
export async function clearLegacySharedLocalData() {
  await AsyncStorage.multiRemove([
    LEGACY_WORKOUTS_KEY,
    LEGACY_LOGS_KEY,
    LEGACY_SESSION_KEY,
    LEGACY_SESSION_HISTORY_KEY,
  ]);
}

export function volumeFromLog(weight: number, reps?: number, sets?: number) {
  return weight * (reps && reps > 0 ? reps : 1) * (sets && sets > 0 ? sets : 1);
}

export function formatTension(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

/**
 * Rough session calorie estimate (not medical-grade).
 * MET × kg × hours for work-timer seconds, plus a small lift-volume bump.
 * Default body weight 170 lb until we collect one on profile.
 */
export function estimateCaloriesBurned(input: {
  tensionSeconds?: number | null;
  volumeLoad?: number | null;
  bodyWeightLb?: number | null;
}): number {
  const seconds = Math.max(0, Number(input.tensionSeconds) || 0);
  const volume = Math.max(0, Number(input.volumeLoad) || 0);
  const lb = Math.max(90, Number(input.bodyWeightLb) || 170);
  const kg = lb * 0.453592;
  const hours = seconds / 3600;
  // Strength / circuit work while the exercise timer is running
  const MET = 5.0;
  const fromTime = MET * kg * hours;
  // Tiny bonus so logging weight still nudges the number
  const fromVolume = volume > 0 ? volume / 2500 : 0;
  return Math.max(0, Math.round(fromTime + fromVolume));
}

export function formatCaloriesEst(n: number) {
  if (!n || n <= 0) return "—";
  return `~${Math.round(n)}`;
}

export function formatVolume(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export function formatVolumeLabel(n: number) {
  return `${formatVolume(n)} lb`;
}

export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function suggestNextWeight(oneRepMax: number, targetReps = 5): number {
  if (oneRepMax <= 0) return 0;
  const reps = Math.max(1, targetReps);
  const working = reps === 1 ? oneRepMax : oneRepMax / (1 + reps / 30);
  const bumped = working * 1.025;
  const rounded = Math.round(bumped / 5) * 5;
  const floor = Math.round((working + 5) / 5) * 5;
  return Math.max(rounded, floor);
}

export function suggestNextFromLast(
  weight: number,
  reps?: number | null
): number {
  if (weight <= 0) return 0;
  const floor = Math.round((weight + 5) / 5) * 5;
  if (reps != null && reps > 0) {
    const oneRm = estimateOneRepMax(weight, reps);
    const fromOneRm = suggestNextWeight(oneRm, reps);
    return Math.max(fromOneRm, floor);
  }
  const bumped = Math.round((weight * 1.025) / 5) * 5;
  return Math.max(bumped, floor);
}
