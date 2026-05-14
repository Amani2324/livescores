/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFootballGetInjuries, apiFootballGetSquad } from "@/lib/api-football/client";
import { requireAdminClient } from "@/lib/cron/auth";
import type { Json } from "@/types/database";

function mapPlayersFromSquad(teamId: number, squad: any[]) {
  const now = new Date().toISOString();
  return squad.map((p) => ({
    id: p.id as number,
    team_id: teamId,
    name: p.name as string,
    age: (p.age ?? null) as number | null,
    number: (p.number ?? null) as number | null,
    position: (p.position ?? null) as string | null,
    photo: (p.photo ?? null) as string | null,
    injured: false,
    injury: null as Json | null,
    updated_at: now,
  }));
}

export async function syncTeamProfile(teamId: number, season: number) {
  const supabase = requireAdminClient();
  const squadRes = await apiFootballGetSquad(teamId);
  const players = squadRes?.players ?? [];
  if (players.length) {
    const rows = mapPlayersFromSquad(teamId, players);
    await supabase.from("players").upsert(rows, { onConflict: "id" });
  }

  const injuries = await apiFootballGetInjuries(teamId, season);
  const injuryPayload = injuries.map((row: any) => ({
    player: row.player,
    league: row.league,
    team: row.team,
    fixture: row.fixture,
    type: row.type,
    reason: row.reason,
  }));

  await supabase
    .from("teams")
    .update({
      injuries: injuryPayload as Json,
      squad: players as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", teamId);

  const injuredIds = new Set(
    injuries.map((row: any) => row.player?.id).filter(Boolean),
  );
  if (injuredIds.size) {
    await supabase
      .from("players")
      .update({ injured: false, injury: null })
      .eq("team_id", teamId);
    for (const row of injuries as any[]) {
      const pid = row.player?.id;
      if (!pid) continue;
      await supabase
        .from("players")
        .update({
          injured: true,
          injury: {
            type: row.type,
            reason: row.reason,
          } as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pid);
    }
  }

  return { ok: true, players: players.length, injuries: injuries.length };
}

export async function syncTrackedTeamsRoster(limitTeams = 20) {
  const supabase = requireAdminClient();
  const season = new Date().getFullYear();
  const { data } = await supabase
    .from("standings")
    .select("team_id")
    .order("updated_at", { ascending: false })
    .limit(limitTeams);
  const ids = [...new Set((data ?? []).map((r) => r.team_id as number))];
  for (const teamId of ids) {
    await syncTeamProfile(teamId, season);
  }
  return { teams: ids.length };
}
