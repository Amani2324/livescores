import { NextResponse } from "next/server";
import { assertCronRequest } from "@/lib/cron/auth";
import { syncLeagueUpcoming, syncTodaysFixtures } from "@/lib/sync/fixtures";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;
  try {
    const today = await syncTodaysFixtures();
    const leagues = await syncLeagueUpcoming();
    return NextResponse.json({ ok: true, today, leagues });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
