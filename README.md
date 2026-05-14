# LiveScores Hub

Next.js 15 football livescores and previews: Supabase cache, API-FOOTBALL sync (server-only), curated leagues, optional API-SPORTS embed widgets.

## Local setup

1. Copy `.env.example` → `.env.local` and fill values.
2. Apply `supabase/migrations/00001_initial_schema.sql` in the Supabase SQL editor.
3. `npm install` then `npm run dev`.

## Deploy to GitHub

```bash
git add -A
git commit -m "Initial livescores platform"
```

Create a new empty repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

(Use SSH if you prefer: `git@github.com:YOUR_USER/YOUR_REPO.git`.)

## Deploy to Vercel

1. [Import the GitHub repo](https://vercel.com/new) in Vercel (Framework Preset: Next.js).
2. Set **Environment variables** (Production + Preview as needed):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — crons + sync only |
| `API_FOOTBALL_KEY` or RapidAPI vars | **Secret** — server/cron only |
| `CRON_SECRET` | Random string; protect `/api/cron/*` when not using Vercel’s cron header |
| `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_FOOTBALL_WIDGET_KEY` | Optional; same as API key if you use embed widgets |
| `SYNC_LEAGUE_IDS` | Optional; comma subset of `src/lib/leagues/curated.ts` IDs |

3. Redeploy after changing env vars.

Cron routes are in `vercel.json`. On Vercel, scheduled jobs send `x-vercel-cron: 1`, which your `assertCronRequest` allows without `CRON_SECRET`. For manual triggers you can still use `Authorization: Bearer <CRON_SECRET>`.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
