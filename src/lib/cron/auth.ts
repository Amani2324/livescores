import { createAdminSupabase } from "@/lib/supabase/admin";

export function assertCronRequest(request: Request): Response | null {
  if (process.env.VERCEL === "1" && request.headers.get("x-vercel-cron") === "1") {
    return null;
  }
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  const header = request.headers.get("x-cron-secret");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (bearer !== secret && header !== secret) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function requireAdminClient() {
  const admin = createAdminSupabase();
  if (!admin) {
    throw new Error("Supabase admin client unavailable (check env)");
  }
  return admin;
}
