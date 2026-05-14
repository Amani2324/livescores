-- Livescores platform: API-Football shaped cache in Supabase
-- Run via Supabase CLI or SQL editor

create extension if not exists "pgcrypto";

-- Leagues tracked for sync and display
create table if not exists public.leagues (
  id bigint primary key,
  name text not null,
  country text,
  logo text,
  flag text,
  type text,
  current_season int not null default extract(year from now())::int,
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id bigint primary key,
  name text not null,
  code text,
  logo text,
  country text,
  founded int,
  national boolean default false,
  venue jsonb,
  coach jsonb,
  squad jsonb,
  injuries jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id bigint primary key,
  team_id bigint references public.teams (id) on delete set null,
  name text not null,
  age int,
  number int,
  position text,
  photo text,
  injured boolean default false,
  injury jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.fixtures (
  id bigint primary key,
  league_id bigint not null references public.leagues (id) on delete cascade,
  season int not null,
  round text,
  date timestamptz not null,
  timezone text,
  status_long text,
  status_short text not null default 'NS',
  status_elapsed int,
  goals_home int not null default 0,
  goals_away int not null default 0,
  home_team_id bigint not null references public.teams (id) on delete cascade,
  away_team_id bigint not null references public.teams (id) on delete cascade,
  home_team_name text not null,
  away_team_name text not null,
  home_team_logo text,
  away_team_logo text,
  venue_name text,
  venue_city text,
  referee text,
  featured boolean default false,
  lineups jsonb,
  statistics jsonb,
  events jsonb,
  is_live boolean not null default false,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fixtures_league_date_idx on public.fixtures (league_id, date);
create index if not exists fixtures_date_idx on public.fixtures (date);
create index if not exists fixtures_live_idx on public.fixtures (is_live) where is_live = true;
create index if not exists fixtures_teams_idx on public.fixtures (home_team_id, away_team_id);

create table if not exists public.standings (
  id bigserial primary key,
  league_id bigint not null references public.leagues (id) on delete cascade,
  season int not null,
  team_id bigint not null references public.teams (id) on delete cascade,
  rank int not null,
  points int not null default 0,
  goals_diff int not null default 0,
  form text,
  description text,
  all_played int not null default 0,
  all_win int not null default 0,
  all_draw int not null default 0,
  all_lose int not null default 0,
  all_goals_for int not null default 0,
  all_goals_against int not null default 0,
  home jsonb,
  away jsonb,
  updated_at timestamptz not null default now(),
  unique (league_id, season, team_id)
);

create index if not exists standings_league_season_idx on public.standings (league_id, season);

create table if not exists public.scorers (
  league_id bigint not null references public.leagues (id) on delete cascade,
  season int not null,
  entries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (league_id, season)
);

create table if not exists public.predictions (
  fixture_id bigint primary key references public.fixtures (id) on delete cascade,
  winner_name text,
  winner_comment text,
  advice text,
  percent_home text,
  percent_draw text,
  percent_away text,
  goals_home text,
  goals_away text,
  comparison jsonb,
  h2h jsonb,
  payload jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.odds (
  id bigserial primary key,
  fixture_id bigint not null references public.fixtures (id) on delete cascade,
  bookmaker text not null,
  bets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (fixture_id, bookmaker)
);

create index if not exists odds_fixture_idx on public.odds (fixture_id);

create table if not exists public.previews (
  id uuid primary key default gen_random_uuid(),
  fixture_id bigint not null unique references public.fixtures (id) on delete cascade,
  locale text not null default 'en',
  title text not null,
  body text not null,
  bettor_insights text,
  source text not null default 'rules_engine',
  model_version text,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists previews_created_idx on public.previews (created_at desc);

-- Public read access for anon (server uses service role for writes)
alter table public.leagues enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.standings enable row level security;
alter table public.scorers enable row level security;
alter table public.predictions enable row level security;
alter table public.odds enable row level security;
alter table public.previews enable row level security;

create policy "leagues_select_public" on public.leagues for select using (true);
create policy "teams_select_public" on public.teams for select using (true);
create policy "players_select_public" on public.players for select using (true);
create policy "fixtures_select_public" on public.fixtures for select using (true);
create policy "standings_select_public" on public.standings for select using (true);
create policy "scorers_select_public" on public.scorers for select using (true);
create policy "predictions_select_public" on public.predictions for select using (true);
create policy "odds_select_public" on public.odds for select using (true);
create policy "previews_select_public" on public.previews for select using (true);
