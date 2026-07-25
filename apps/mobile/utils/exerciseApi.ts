import Constants from "expo-constants";
import { WorkoutX } from "@workoutx/sdk";

// ---------------------------------------------------------------------------
// WorkoutX (active)
// ---------------------------------------------------------------------------

const WORKOUTX_BASE = "https://api.workoutxapp.com";
export const EXERCISE_GIF_RESOLUTION = 360;

function getWorkoutXApiKey() {
  const fromConfig = Constants.expoConfig?.extra?.workoutxApiKey;
  const fromEnv = process.env.EXPO_PUBLIC_WORKOUTX_API_KEY;
  return String(fromConfig ?? fromEnv ?? "").trim();
}

export function getMaskedApiKey() {
  const key = getWorkoutXApiKey();
  if (!key) return "missing";
  if (key.length <= 8) return `invalid (${key.length} chars)`;
  return `${key.slice(0, 8)}...${key.slice(-8)} (${key.length} chars)`;
}

let wxClient: WorkoutX | null = null;

function getWorkoutXClient() {
  const apiKey = getWorkoutXApiKey();
  if (!apiKey) {
    throw new Error(
      "WorkoutX API key missing. Set EXPO_PUBLIC_WORKOUTX_API_KEY in .env, then restart Metro with: npm start -- --clear"
    );
  }
  if (!wxClient) {
    wxClient = new WorkoutX({ apiKey, baseUrl: WORKOUTX_BASE });
  }
  return wxClient;
}

/** Direct GIF URL for <Image source={{ uri }} /> (API key in query string). */
export function getExerciseImageUri(exerciseId: string, _resolution = EXERCISE_GIF_RESOLUTION) {
  const wx = getWorkoutXClient();
  return wx.gifUrl(exerciseId);
}

export function getExerciseImageSource(
  exerciseId: string,
  resolution = EXERCISE_GIF_RESOLUTION
) {
  return { uri: getExerciseImageUri(exerciseId, resolution) };
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: unknown[] }).data;
  }
  return [];
}

/**
 * Compatibility wrapper around the old ExerciseDB-style paths used by screens.
 * Maps to WorkoutX SDK methods and returns arrays (list) or a single exercise.
 */
export async function fetchExercises(path: string) {
  const wx = getWorkoutXClient();
  const decoded = decodeURIComponent(path);

  try {
    // /exercises/exercise/:id
    const byId = decoded.match(/^\/exercises\/exercise\/(.+)$/);
    if (byId?.[1]) {
      return await wx.exercises.get(byId[1]);
    }

    // /exercises/equipment/:equipment
    const byEquipment = decoded.match(/^\/exercises\/equipment\/(.+)$/);
    if (byEquipment?.[1]) {
      const page = await wx.exercises.byEquipment(byEquipment[1], { limit: 100 });
      return unwrapList(page);
    }

    // /exercises/bodyPart/:bodyPart
    const byBodyPart = decoded.match(/^\/exercises\/bodyPart\/(.+)$/);
    if (byBodyPart?.[1]) {
      const page = await wx.exercises.byBodyPart(byBodyPart[1], { limit: 100 });
      return unwrapList(page);
    }

    // /exercises/name/:name
    const byName = decoded.match(/^\/exercises\/name\/(.+)$/);
    if (byName?.[1]) {
      return await wx.exercises.byName(byName[1], { limit: 100 });
    }

    throw new Error(`Unsupported exercise path: ${path}`);
  } catch (err: any) {
    const status = err?.status ?? "";
    const message = err?.message ?? "Request failed";
    throw new Error(status ? `${status}: ${message}` : message);
  }
}

export async function testExerciseApiConnection() {
  const data = await fetchExercises("/exercises/name/squat");
  const count = Array.isArray(data) ? data.length : 0;
  return { ok: true, count, key: getMaskedApiKey() };
}

// ---------------------------------------------------------------------------
// ExerciseDB / RapidAPI (legacy — keep for easy rollback)
// ---------------------------------------------------------------------------

/*
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`;
// Request the best tier available; BASIC plans still receive 180px assets.
export const EXERCISE_GIF_RESOLUTION = 360;

function getApiKey() {
  const fromConfig = Constants.expoConfig?.extra?.apiKey;
  const fromEnv = process.env.EXPO_PUBLIC_API_KEY;
  return String(fromConfig ?? fromEnv ?? "").trim();
}

export function getMaskedApiKey() {
  const key = getApiKey();
  if (!key) return "missing";
  if (key.length <= 8) return `invalid (${key.length} chars)`;
  return `${key.slice(0, 8)}...${key.slice(-8)} (${key.length} chars)`;
}

export function getExerciseApiHeaders() {
  const key = getApiKey();
  return {
    "X-RapidAPI-Key": key,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
  };
}

export function getExerciseImageUri(
  exerciseId: string,
  resolution = EXERCISE_GIF_RESOLUTION
) {
  const key = getApiKey();
  const params = new URLSearchParams({
    exerciseId,
    resolution: String(resolution),
    "rapidapi-key": key,
  });
  return `${RAPIDAPI_BASE}/image?${params.toString()}`;
}

export function getExerciseImageSource(
  exerciseId: string,
  resolution = EXERCISE_GIF_RESOLUTION
) {
  return { uri: getExerciseImageUri(exerciseId, resolution) };
}

export async function fetchExercises(path: string) {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      "API key missing. Set EXPO_PUBLIC_API_KEY in .env, then restart Metro with: npm start -- --clear"
    );
  }

  const url = `${RAPIDAPI_BASE}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getExerciseApiHeaders(),
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${response.status}`;
    throw new Error(`${response.status}: ${message}`);
  }

  return data;
}

export async function testExerciseApiConnection() {
  const data = await fetchExercises("/exercises/name/squat");
  const count = Array.isArray(data) ? data.length : 0;
  return { ok: true, count, key: getMaskedApiKey() };
}
*/
