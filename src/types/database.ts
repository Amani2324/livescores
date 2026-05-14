export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface LeagueRow {
  id: number;
  name: string;
  country: string | null;
  logo: string | null;
  flag: string | null;
  type: string | null;
  current_season: number;
  updated_at: string;
}

export interface TeamRow {
  id: number;
  name: string;
  code: string | null;
  logo: string | null;
  country: string | null;
  founded: number | null;
  national: boolean | null;
  venue: Json | null;
  coach: Json | null;
  squad: Json | null;
  injuries: Json | null;
  updated_at: string;
}

export interface FixtureRow {
  id: number;
  league_id: number;
  season: number;
  round: string | null;
  date: string;
  timezone: string | null;
  status_long: string | null;
  status_short: string;
  status_elapsed: number | null;
  goals_home: number;
  goals_away: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  venue_name: string | null;
  venue_city: string | null;
  referee: string | null;
  featured: boolean | null;
  lineups: Json | null;
  statistics: Json | null;
  events: Json | null;
  is_live: boolean;
  raw: Json | null;
  created_at: string;
  updated_at: string;
}

export interface StandingRow {
  id: number;
  league_id: number;
  season: number;
  team_id: number;
  rank: number;
  points: number;
  goals_diff: number;
  form: string | null;
  description: string | null;
  all_played: number;
  all_win: number;
  all_draw: number;
  all_lose: number;
  all_goals_for: number;
  all_goals_against: number;
  home: Json | null;
  away: Json | null;
  updated_at: string;
}

export interface ScorerRow {
  league_id: number;
  season: number;
  entries: Json;
  updated_at: string;
}

export interface PredictionRow {
  fixture_id: number;
  winner_name: string | null;
  winner_comment: string | null;
  advice: string | null;
  percent_home: string | null;
  percent_draw: string | null;
  percent_away: string | null;
  goals_home: string | null;
  goals_away: string | null;
  comparison: Json | null;
  h2h: Json | null;
  payload: Json | null;
  updated_at: string;
}

export interface OddRow {
  id: number;
  fixture_id: number;
  bookmaker: string;
  bets: Json;
  updated_at: string;
}

export interface PreviewRow {
  id: string;
  fixture_id: number;
  locale: string;
  title: string;
  body: string;
  bettor_insights: string | null;
  source: string;
  model_version: string | null;
  meta: Json | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerRow {
  id: number;
  team_id: number | null;
  name: string;
  age: number | null;
  number: number | null;
  position: string | null;
  photo: string | null;
  injured: boolean | null;
  injury: Json | null;
  updated_at: string;
}
