import { NextResponse } from "next/server";
import { assertCronRequest } from "@/lib/cron/auth";
import { syncLiveMatches } from "@/lib/sync/live";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;
  try {
    const result = await syncLiveMatches();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
