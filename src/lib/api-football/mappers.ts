/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Json } from "@/types/database";

export function mapLeagueFromFixture(league: any) {
  return {
    id: league.id as number,
    name: league.name as string,
    country: (league.country ?? null) as string | null,
    logo: (league.logo ?? null) as string | null,
    flag: (league.flag ?? null) as string | null,
    type: (league.type ?? null) as string | null,
    current_season: league.season as number,
    updated_at: new Date().toISOString(),
  };
}

export function mapTeam(team: any) {
  return {
    id: team.id as number,
    name: team.name as string,
    code: (team.code ?? null) as string | null,
    logo: (team.logo ?? null) as string | null,
    country: (team.country ?? null) as string | null,
    founded: (team.founded ?? null) as number | null,
    national: Boolean(team.national),
    venue: (team.venue ?? null) as Json,
    coach: null as Json | null,
    squad: null as Json | null,
    injuries: null as Json | null,
    updated_at: new Date().toISOString(),
  };
}

export function mapFixtureRow(item: any) {
  const fx = item.fixture;
  const lg = item.league;
  const teams = item.teams;
  const goals = item.goals ?? { home: null, away: null };
  const venue = fx.venue;
  const short = fx.status?.short ?? "NS";
  const elapsed = fx.status?.elapsed ?? null;
  const isLive = ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(short);

  return {
    id: fx.id as number,
    league_id: lg.id as number,
    season: lg.season as number,
    round: (fx.round ?? null) as string | null,
    date: fx.date as string,
    timezone: (fx.timezone ?? null) as string | null,
    status_long: (fx.status?.long ?? null) as string | null,
    status_short: short,
    status_elapsed: elapsed,
    goals_home: goals.home ?? 0,
    goals_away: goals.away ?? 0,
    home_team_id: teams.home.id as number,
    away_team_id: teams.away.id as number,
    home_team_name: teams.home.name as string,
    away_team_name: teams.away.name as string,
    home_team_logo: (teams.home.logo ?? null) as string | null,
    away_team_logo: (teams.away.logo ?? null) as string | null,
    venue_name: (venue?.name ?? null) as string | null,
    venue_city: (venue?.city ?? null) as string | null,
    referee: (fx.referee ?? null) as string | null,
    featured: false,
    lineups: (item.lineups ?? null) as Json | null,
    statistics: (item.statistics ?? null) as Json | null,
    events: (item.events ?? null) as Json | null,
    is_live: isLive,
    raw: item as Json,
    updated_at: new Date().toISOString(),
  };
}

export function mapStandingsRows(
  leagueId: number,
  season: number,
  apiResponse: any[],
): Array<Record<string, unknown>> {
  const leagueTable = apiResponse?.[0]?.league?.standings?.[0] ?? [];
  return leagueTable.map((row: any, idx: number) => ({
    league_id: leagueId,
    season,
    team_id: row.team.id as number,
    rank: row.rank ?? idx + 1,
    points: row.points ?? 0,
    goals_diff: row.goalsDiff ?? 0,
    form: (row.form ?? null) as string | null,
    description: (row.description ?? null) as string | null,
    all_played: row.all?.played ?? 0,
    all_win: row.all?.win ?? 0,
    all_draw: row.all?.draw ?? 0,
    all_lose: row.all?.lose ?? 0,
    all_goals_for: row.all?.goals?.for ?? 0,
    all_goals_against: row.all?.goals?.against ?? 0,
    home: (row.home ?? null) as Json,
    away: (row.away ?? null) as Json,
    updated_at: new Date().toISOString(),
  }));
}

export function mapScorerEntries(api: any[]): Json {
  return api.map((p) => ({
    player: {
      id: p.player?.id,
      name: p.player?.name,
      photo: p.player?.photo,
    },
    team: {
      id: p.statistics?.[0]?.team?.id,
      name: p.statistics?.[0]?.team?.name,
      logo: p.statistics?.[0]?.team?.logo,
    },
    goals: p.statistics?.[0]?.goals?.total ?? 0,
    assists: p.statistics?.[0]?.goals?.assists ?? 0,
    appearances: p.statistics?.[0]?.games?.appearences ?? 0,
  }));
}

export function mapPredictionRow(fixtureId: number, pred: any) {
  const p = pred.predictions;
  return {
    fixture_id: fixtureId,
    winner_name: (p?.winner?.name ?? null) as string | null,
    winner_comment: (p?.winner?.comment ?? null) as string | null,
    advice: (p?.advice ?? null) as string | null,
    percent_home: p?.percent?.home != null ? String(p.percent.home) : null,
    percent_draw: p?.percent?.draw != null ? String(p.percent.draw) : null,
    percent_away: p?.percent?.away != null ? String(p.percent.away) : null,
    goals_home: p?.goals?.home != null ? String(p.goals.home) : null,
    goals_away: p?.goals?.away != null ? String(p.goals.away) : null,
    comparison: (pred.comparison ?? null) as Json,
    h2h: (pred.h2h ?? null) as Json,
    payload: pred as Json,
    updated_at: new Date().toISOString(),
  };
}
