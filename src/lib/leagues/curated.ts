/**
 * Competitions we surface in the product (sync + UI).
 * IDs are API-FOOTBALL (api-sports) v3 `league.id` values.
 * To tweak: use SYNC_LEAGUE_IDS as a comma subset of this list (must be IDs below).
 */
export const CURATED_LEAGUES = [
  { id: 39, name: "Premier League", group: "England" },
  { id: 40, name: "Championship", group: "England" },
  { id: 41, name: "League One", group: "England" },
  { id: 140, name: "La Liga", group: "Spain" },
  { id: 141, name: "La Liga 2", group: "Spain" },
  { id: 61, name: "Ligue 1 (France)", group: "Europe" },
  { id: 135, name: "Serie A", group: "Europe" },
  { id: 78, name: "Bundesliga", group: "Europe" },
  { id: 94, name: "Liga Portugal", group: "Europe" },
  { id: 88, name: "Eredivisie", group: "Europe" },
  { id: 144, name: "Belgium Pro League", group: "Europe" },
  { id: 179, name: "Scottish Premiership", group: "Europe" },
  { id: 203, name: "Süper Lig", group: "Europe" },
  { id: 2, name: "Champions League", group: "UEFA" },
  { id: 3, name: "Europa League", group: "UEFA" },
  { id: 848, name: "Conference League", group: "UEFA" },
  { id: 531, name: "UEFA Super Cup", group: "UEFA" },
  { id: 1, name: "FIFA World Cup", group: "International" },
  { id: 12, name: "CAF Champions League", group: "Africa" },
  { id: 20, name: "CAF Confederation Cup", group: "Africa" },
  { id: 566, name: "Burundi — Ligue A", group: "Africa" },
  { id: 405, name: "Rwanda — NSL", group: "Africa" },
  { id: 567, name: "Tanzania — Ligi kuu", group: "Africa" },
] as const;

export type CuratedLeagueGroup = (typeof CURATED_LEAGUES)[number]["group"];

export const CURATED_LEAGUE_IDS: readonly number[] = CURATED_LEAGUES.map((l) => l.id);

const CURATED_SET = new Set<number>(CURATED_LEAGUE_IDS);

export function getCuratedLeagueIds(): number[] {
  return [...CURATED_LEAGUE_IDS];
}

export function isCuratedLeagueId(leagueId: number): boolean {
  return CURATED_SET.has(leagueId);
}

/** If SYNC_LEAGUE_IDS is set, only those IDs that are also curated are used (API saver). Otherwise all curated. */
export function getEffectiveSyncLeagueIds(): number[] {
  const raw = process.env.SYNC_LEAGUE_IDS?.trim();
  if (!raw) return getCuratedLeagueIds();
  const parsed = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  const subset = parsed.filter((id) => CURATED_SET.has(id));
  return subset.length > 0 ? subset : getCuratedLeagueIds();
}

export function sortLeaguesByCuratedOrder<T extends { id: number }>(rows: T[]): T[] {
  const order = new Map<number, number>(getCuratedLeagueIds().map((id, i) => [id, i]));
  return [...rows].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
}

export function filterByCuratedLeague<T extends { league_id: number }>(rows: T[]): T[] {
  return rows.filter((r) => CURATED_SET.has(r.league_id));
}

const GROUP_ORDER: CuratedLeagueGroup[] = [
  "England",
  "Spain",
  "Europe",
  "UEFA",
  "International",
  "Africa",
];

export function getCuratedLeaguesByGroup(): { group: CuratedLeagueGroup; leagues: (typeof CURATED_LEAGUES)[number][] }[] {
  const map = new Map<CuratedLeagueGroup, (typeof CURATED_LEAGUES)[number][]>();
  for (const league of CURATED_LEAGUES) {
    const list = map.get(league.group) ?? [];
    list.push(league);
    map.set(league.group, list);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((group) => ({
    group,
    leagues: map.get(group)!,
  }));
}
