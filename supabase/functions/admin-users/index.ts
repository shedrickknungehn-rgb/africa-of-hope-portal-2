import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");

    const caller = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: auth } = await caller.auth.getUser();
    if (!auth?.user) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(url, service);
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single();
    if (profile?.role !== "Super Admin") {
      return json({ error: "Super Admin access required" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      if (!email || password.length < 8) {
        return json({ error: "A valid email and an 8+ character password are required" }, 400);
      }
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: String(body.name ?? email.split("@")[0]),
          role: String(body.role ?? "Teacher"),
          status: "Active",
        },
      });
      if (error) return json({ error: error.message }, 400);

      await admin
        .from("profiles")
        .update({
          name: String(body.name ?? email.split("@")[0]),
          full_name: String(body.name ?? email.split("@")[0]),
          email,
          phone: String(body.phone ?? ""),
          role: String(body.role ?? "Teacher"),
          status: "Active",
          title: body.title ? String(body.title) : null,
        })
        .eq("id", created.user.id);

      return json({ user_id: created.user.id });
    }

    if (action === "update") {
      const id = String(body.user_id ?? "");
      if (!id) return json({ error: "user_id is required" }, 400);
      const { error } = await admin
        .from("profiles")
        .update({
          role: String(body.role ?? "Student"),
          status: String(body.status ?? "Active"),
        })
        .eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const id = String(body.user_id ?? "");
      if (!id) return json({ error: "user_id is required" }, 400);
      if (id === auth.user.id) return json({ error: "You cannot delete your own account" }, 400);
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});