import type { FixtureRow } from "@/types/database";

export function fixturePath(id: number) {
  return `/match/${id}`;
}

export function leaguePath(id: number) {
  return `/league/${id}`;
}

export function teamPath(id: number) {
  return `/team/${id}`;
}

export function fixtureTitle(f: FixtureRow) {
  return `${f.home_team_name} vs ${f.away_team_name} | Live score & preview`;
}

export function fixtureDescription(f: FixtureRow) {
  return `Live score, lineups, stats, odds, and AI preview for ${f.home_team_name} vs ${f.away_team_name}.`;
}
