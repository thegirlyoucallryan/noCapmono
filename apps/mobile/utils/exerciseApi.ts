import Constants from "expo-constants";
import { WorkoutX } from "@workoutx/sdk";
import { supabase } from "./supabase";

// ---------------------------------------------------------------------------
// WorkoutX via shared Supabase cache (demand-driven) + direct SDK fallback
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

type CacheAction =
  | {
      action: "page";
      kind: ExerciseListKind;
      value: string;
      offset: number;
      limit: number;
    }
  | { action: "exercise"; id: string }
  | { action: "gif"; id: string };

async function invokeExerciseCache<T>(body: CacheAction): Promise<T | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return null;

    const { data, error } = await supabase.functions.invoke("exercise-cache", {
      body,
    });
    if (error) {
      console.warn("[exercise-cache]", error.message);
      return null;
    }
    if (data && typeof data === "object" && "error" in data && data.error) {
      console.warn("[exercise-cache]", String(data.error));
      return null;
    }
    return data as T;
  } catch (e) {
    console.warn(
      "[exercise-cache]",
      e instanceof Error ? e.message : "invoke failed"
    );
    return null;
  }
}

/** Direct GIF URL (counts against WorkoutX). Prefer resolveExerciseGifUri. */
export function getExerciseImageUri(
  exerciseId: string,
  _resolution = EXERCISE_GIF_RESOLUTION
) {
  const wx = getWorkoutXClient();
  return wx.gifUrl(exerciseId);
}

export function getExerciseImageSource(
  exerciseId: string,
  resolution = EXERCISE_GIF_RESOLUTION
) {
  return { uri: getExerciseImageUri(exerciseId, resolution) };
}

const gifUriCache = new Map<string, string>();
const gifUriInflight = new Map<string, Promise<string>>();

/**
 * Resolve a GIF URL via shared server cache (Supabase Storage) when possible.
 * Falls back to direct WorkoutX gifUrl so the UI still works pre-deploy.
 */
export async function resolveExerciseGifUri(
  exerciseId: string,
  _resolution = EXERCISE_GIF_RESOLUTION
): Promise<string> {
  const id = String(exerciseId || "").trim().replace(/\.gif$/i, "");
  if (!id) throw new Error("exerciseId required");

  const cached = gifUriCache.get(id);
  if (cached) return cached;

  const inflight = gifUriInflight.get(id);
  if (inflight) return inflight;

  const promise = (async () => {
    const fromCache = await invokeExerciseCache<{ url?: string }>({
      action: "gif",
      id,
    });
    const url =
      fromCache?.url && typeof fromCache.url === "string"
        ? fromCache.url
        : getExerciseImageUri(id);
    gifUriCache.set(id, url);
    return url;
  })().finally(() => {
    gifUriInflight.delete(id);
  });

  gifUriInflight.set(id, promise);
  return promise;
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

export const EXERCISE_PAGE_SIZE = 100;

export type ExerciseListKind = "equipment" | "bodyPart" | "name";

export type ExercisePage = {
  exercises: any[];
  total: number;
  offset: number;
  hasMore: boolean;
};

/** Soft-normalize plurals so "squats" pages the rich "squat" catalog. */
export function normalizeSearchTerm(raw: string) {
  const lower = String(raw).trim().toLowerCase();
  if (
    lower.length > 3 &&
    /s$/i.test(lower) &&
    !/(ss|us|is|oes)$/i.test(lower)
  ) {
    return lower.endsWith("ies")
      ? `${lower.slice(0, -3)}y`
      : lower.replace(/s$/i, "");
  }
  return lower;
}

function toPage(raw: unknown, offset: number, limit: number): ExercisePage {
  const exercises = unwrapList(raw);
  const total =
    raw &&
    typeof raw === "object" &&
    "total" in raw &&
    typeof (raw as { total: unknown }).total === "number"
      ? (raw as { total: number }).total
      : offset + exercises.length;
  return {
    exercises,
    total,
    offset,
    hasMore: offset + exercises.length < total,
  };
}

function pageFromCachePayload(data: {
  exercises?: unknown[];
  total?: number;
  offset?: number;
  hasMore?: boolean;
}): ExercisePage | null {
  if (!data || !Array.isArray(data.exercises)) return null;
  const offset = Number(data.offset) || 0;
  const total =
    typeof data.total === "number" ? data.total : offset + data.exercises.length;
  return {
    exercises: data.exercises,
    total,
    offset,
    hasMore:
      typeof data.hasMore === "boolean"
        ? data.hasMore
        : offset + data.exercises.length < total,
  };
}

/**
 * Paginated list fetch — shared cache first, then WorkoutX.
 */
export async function fetchExercisePage(
  kind: ExerciseListKind,
  value: string,
  offset = 0,
  limit = EXERCISE_PAGE_SIZE
): Promise<ExercisePage> {
  const cached = await invokeExerciseCache<{
    exercises?: unknown[];
    total?: number;
    offset?: number;
    hasMore?: boolean;
  }>({
    action: "page",
    kind,
    value,
    offset,
    limit,
  });
  const fromCache = cached ? pageFromCachePayload(cached) : null;
  if (fromCache) return fromCache;

  const wx = getWorkoutXClient();
  const params = { limit, offset };

  try {
    if (kind === "equipment") {
      const page = await wx.exercises.byEquipment(value, params);
      return toPage(page, offset, limit);
    }
    if (kind === "bodyPart") {
      const page = await wx.exercises.byBodyPart(value, params);
      return toPage(page, offset, limit);
    }
    const page = await wx.exercises.byName(normalizeSearchTerm(value), params);
    return toPage(page, offset, limit);
  } catch (err: any) {
    const status = err?.status ?? "";
    const message = err?.message ?? "Request failed";
    throw new Error(status ? `${status}: ${message}` : message);
  }
}

/**
 * Compatibility wrapper around the old ExerciseDB-style paths used by screens.
 */
export async function fetchExercises(path: string) {
  const decoded = decodeURIComponent(path);

  try {
    const byId = decoded.match(/^\/exercises\/exercise\/(.+)$/);
    if (byId?.[1]) {
      const cached = await invokeExerciseCache<{ exercise?: unknown }>({
        action: "exercise",
        id: byId[1],
      });
      if (cached?.exercise) return cached.exercise;
      return await getWorkoutXClient().exercises.get(byId[1]);
    }

    const byEquipment = decoded.match(/^\/exercises\/equipment\/(.+)$/);
    if (byEquipment?.[1]) {
      const page = await fetchExercisePage("equipment", byEquipment[1], 0);
      return page.exercises;
    }

    const byBodyPart = decoded.match(/^\/exercises\/bodyPart\/(.+)$/);
    if (byBodyPart?.[1]) {
      const page = await fetchExercisePage("bodyPart", byBodyPart[1], 0);
      return page.exercises;
    }

    const byName = decoded.match(/^\/exercises\/name\/(.+)$/);
    if (byName?.[1]) {
      const page = await fetchExercisePage("name", byName[1], 0);
      return page.exercises;
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
