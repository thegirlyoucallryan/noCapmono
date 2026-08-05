// Shared WorkoutX cache proxy (demand-driven).
// Set secret: supabase secrets set WORKOUTX_API_KEY=wx_...
// Auto-provided: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const WORKOUTX_BASE = "https://api.workoutxapp.com";
const PAGE_TTL_MS = 1000 * 60 * 60 * 24 * 21;
const EXERCISE_TTL_MS = 1000 * 60 * 60 * 24 * 45;
const GIF_TTL_MS = 1000 * 60 * 60 * 24 * 365;

type PageKind = "equipment" | "bodyPart" | "name";

type RequestBody = {
  action: "page" | "exercise" | "gif";
  kind?: PageKind;
  value?: string;
  offset?: number;
  limit?: number;
  id?: string;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function normalizeSearchTerm(raw: string) {
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

function pageKey(kind: PageKind, value: string, offset: number, limit: number) {
  const v =
    kind === "name" ? normalizeSearchTerm(value) : value.trim().toLowerCase();
  return `page:${kind}:${v}:${offset}:${limit}`;
}

async function wxGet(
  path: string,
  apiKey: string,
  query?: Record<string, string>
) {
  const url = new URL(WORKOUTX_BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-WorkoutX-Key": apiKey,
      "User-Agent": "nocap-exercise-cache/1.0",
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new Error(`${res.status}: ${message}`);
  }
  return body;
}

async function wxGetGif(id: string, apiKey: string) {
  const name = /\.gif$/i.test(id) ? id : `${id}.gif`;
  const res = await fetch(
    `${WORKOUTX_BASE}/v1/gifs/${encodeURIComponent(name)}`,
    {
      headers: {
        Accept: "*/*",
        "X-WorkoutX-Key": apiKey,
        "User-Agent": "nocap-exercise-cache/1.0",
      },
    }
  );
  if (!res.ok) throw new Error(`${res.status}: GIF fetch failed`);
  return {
    bytes: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/gif",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const apiKey = Deno.env.get("WORKOUTX_API_KEY")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!apiKey || !supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const body = (await req.json()) as RequestBody;
    const now = Date.now();

    const readCache = async (cacheKey: string) => {
      const { data } = await admin
        .from("wx_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (!data) return null;
      if (new Date(data.expires_at).getTime() < now) return null;
      return data;
    };

    const writeCache = async (row: {
      cache_key: string;
      kind: string;
      payload?: unknown;
      storage_path?: string | null;
      content_type?: string | null;
      expires_at: string;
    }) => {
      await admin.from("wx_cache").upsert({
        cache_key: row.cache_key,
        kind: row.kind,
        payload: row.payload ?? null,
        storage_path: row.storage_path ?? null,
        content_type: row.content_type ?? null,
        created_at: new Date().toISOString(),
        expires_at: row.expires_at,
      });
    };

    if (body.action === "page") {
      const kind = body.kind;
      const value = String(body.value || "").trim();
      const offset = Number(body.offset) || 0;
      const limit = Math.min(Math.max(Number(body.limit) || 100, 1), 100);
      if (!kind || !value) return json({ error: "kind and value required" }, 400);

      const cacheKey = pageKey(kind, value, offset, limit);
      const hit = await readCache(cacheKey);
      if (hit?.payload) {
        return json({ ...(hit.payload as object), cached: true });
      }

      const q = { limit: String(limit), offset: String(offset) };
      let raw: unknown;
      if (kind === "equipment") {
        raw = await wxGet(
          `/v1/exercises/equipment/${encodeURIComponent(value)}`,
          apiKey,
          q
        );
      } else if (kind === "bodyPart") {
        raw = await wxGet(
          `/v1/exercises/bodyPart/${encodeURIComponent(value.toLowerCase())}`,
          apiKey,
          q
        );
      } else {
        raw = await wxGet(
          `/v1/exercises/name/${encodeURIComponent(normalizeSearchTerm(value))}`,
          apiKey,
          q
        );
      }

      const exercises = unwrapList(raw);
      const total =
        raw &&
        typeof raw === "object" &&
        "total" in raw &&
        typeof (raw as { total: unknown }).total === "number"
          ? (raw as { total: number }).total
          : offset + exercises.length;

      const payload = {
        exercises,
        total,
        offset,
        hasMore: offset + exercises.length < total,
      };

      await writeCache({
        cache_key: cacheKey,
        kind: "page",
        payload,
        expires_at: new Date(now + PAGE_TTL_MS).toISOString(),
      });

      return json({ ...payload, cached: false });
    }

    if (body.action === "exercise") {
      const id = String(body.id || "").trim();
      if (!id) return json({ error: "id required" }, 400);
      const cacheKey = `exercise:${id}`;
      const hit = await readCache(cacheKey);
      if (hit?.payload) {
        return json({ exercise: hit.payload, cached: true });
      }

      const exercise = await wxGet(
        `/v1/exercises/exercise/${encodeURIComponent(id)}`,
        apiKey
      );
      await writeCache({
        cache_key: cacheKey,
        kind: "exercise",
        payload: exercise,
        expires_at: new Date(now + EXERCISE_TTL_MS).toISOString(),
      });
      return json({ exercise, cached: false });
    }

    if (body.action === "gif") {
      const id = String(body.id || "").trim().replace(/\.gif$/i, "");
      if (!id) return json({ error: "id required" }, 400);
      const cacheKey = `gif:${id}`;
      const storagePath = `${id}.gif`;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/wx-gifs/${storagePath}`;

      const hit = await readCache(cacheKey);
      if (hit?.storage_path) {
        return json({ url: publicUrl, cached: true });
      }

      const { data: listed } = await admin.storage
        .from("wx-gifs")
        .list("", { search: id, limit: 20 });
      if (listed?.some((f) => f.name === storagePath)) {
        await writeCache({
          cache_key: cacheKey,
          kind: "gif",
          storage_path: storagePath,
          content_type: "image/gif",
          expires_at: new Date(now + GIF_TTL_MS).toISOString(),
        });
        return json({ url: publicUrl, cached: true });
      }

      const { bytes, contentType } = await wxGetGif(id, apiKey);
      const { error: upErr } = await admin.storage
        .from("wx-gifs")
        .upload(storagePath, bytes, { contentType, upsert: true });
      if (upErr) {
        return json({ error: `GIF upload failed: ${upErr.message}` }, 500);
      }

      await writeCache({
        cache_key: cacheKey,
        kind: "gif",
        storage_path: storagePath,
        content_type: contentType,
        expires_at: new Date(now + GIF_TTL_MS).toISOString(),
      });

      return json({ url: publicUrl, cached: false });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cache proxy failed";
    return json({ error: message }, 500);
  }
});
