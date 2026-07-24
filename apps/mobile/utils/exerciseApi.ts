import Constants from "expo-constants";

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
