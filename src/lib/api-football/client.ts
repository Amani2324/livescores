/* eslint-disable @typescript-eslint/no-explicit-any */
import { takeToken } from "@/lib/rate-limit";

const DEFAULT_BASE = "https://v3.football.api-sports.io";

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, unknown>;
  errors: unknown;
  results: number;
  paging?: { current: number; total: number };
  response: T;
}

function buildHeaders(): HeadersInit {
  const rapidKey = process.env.API_FOOTBALL_RAPIDAPI_KEY;
  const rapidHost =
    process.env.API_FOOTBALL_RAPIDAPI_HOST ?? "v3.football.api-sports.io";
  if (rapidKey) {
    return {
      "X-RapidAPI-Key": rapidKey,
      "X-RapidAPI-Host": rapidHost,
    };
  }
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    throw new Error("API_FOOTBALL_KEY or API_FOOTBALL_RAPIDAPI_KEY is required");
  }
  return { "x-apisports-key": key };
}

function baseUrl(): string {
  return process.env.API_FOOTBALL_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_BASE;
}

export async function apiFootballFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<ApiFootballResponse<T>> {
  if (!takeToken("api-football-outbound", 90)) {
    throw new Error("API-Football outbound rate limit reached");
  }
  const url = new URL(path.startsWith("http") ? path : `${baseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    headers: buildHeaders(),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API-Football HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as ApiFootballResponse<T>;
}

export async function apiFootballGetLiveFixtures(): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/fixtures", { live: "all" });
  return data.response ?? [];
}

export async function apiFootballGetFixturesByDate(date: string): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/fixtures", { date });
  return data.response ?? [];
}

export async function apiFootballGetFixturesByDateAndLeague(
  date: string,
  league: number,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/fixtures", { date, league });
  return data.response ?? [];
}

export async function apiFootballGetFixturesByLeague(
  league: number,
  season: number,
  next = 50,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/fixtures", {
    league,
    season,
    next,
  });
  return data.response ?? [];
}

export async function apiFootballGetStandings(
  league: number,
  season: number,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/standings", { league, season });
  return data.response ?? [];
}

export async function apiFootballGetTopScorers(
  league: number,
  season: number,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/players/topscorers", {
    league,
    season,
  });
  return data.response ?? [];
}

export async function apiFootballGetFixtureById(id: number): Promise<any | null> {
  const data = await apiFootballFetch<any[]>("/fixtures", { id });
  return data.response?.[0] ?? null;
}

export async function apiFootballGetPredictions(fixture: number): Promise<any | null> {
  const data = await apiFootballFetch<any[]>("/predictions", { fixture });
  return data.response?.[0] ?? null;
}

export async function apiFootballGetOdds(fixture: number): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/odds", { fixture });
  return data.response ?? [];
}

export async function apiFootballGetHeadToHead(
  home: number,
  away: number,
  last = 10,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/fixtures/headtohead", {
    h2h: `${home}-${away}`,
    last,
  });
  return data.response ?? [];
}

export async function apiFootballGetTeamStatistics(
  team: number,
  league: number,
  season: number,
): Promise<any | null> {
  const data = await apiFootballFetch<any[]>("/teams/statistics", {
    team,
    league,
    season,
  });
  return data.response?.[0] ?? null;
}

export async function apiFootballGetInjuries(
  team: number,
  season: number,
): Promise<any[]> {
  const data = await apiFootballFetch<any[]>("/injuries", { team, season });
  return data.response ?? [];
}

export async function apiFootballGetSquad(team: number): Promise<any | null> {
  const data = await apiFootballFetch<any[]>("/players/squads", { team });
  return data.response?.[0] ?? null;
}
