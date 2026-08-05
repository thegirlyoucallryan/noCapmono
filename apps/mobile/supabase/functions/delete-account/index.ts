// Permanently deletes the authenticated user's auth account.
// Cascades profiles / workouts / exercise_logs via FK ON DELETE CASCADE.
// Auto-provided: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("[delete-account]", deleteError.message);
      return json({ error: deleteError.message || "Delete failed" }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("[delete-account]", e);
    return json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      500
    );
  }
});
