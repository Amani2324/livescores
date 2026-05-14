import { NextResponse } from "next/server";
import { assertCronRequest } from "@/lib/cron/auth";
import { syncStandingsAndScorers } from "@/lib/sync/standings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;
  try {
    const result = await syncStandingsAndScorers();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
