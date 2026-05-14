import type { MetadataRoute } from "next";
import { getCuratedLeagueIds } from "@/lib/leagues/curated";
import { createPublicSupabase } from "@/lib/supabase/public";
import { getPublicSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteUrl();
  const supabase = createPublicSupabase();
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/livescores`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
  ];
  if (!supabase) return routes;

  const curated = getCuratedLeagueIds();
  const { data: leagues } = await supabase.from("leagues").select("id,updated_at").in("id", curated);
  for (const league of leagues ?? []) {
    routes.push({
      url: `${base}/league/${league.id}`,
      lastModified: league.updated_at ? new Date(league.updated_at) : new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    });
  }

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("id,updated_at")
    .in("league_id", curated)
    .gte("date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString())
    .limit(400);

  for (const fx of fixtures ?? []) {
    routes.push({
      url: `${base}/match/${fx.id}`,
      lastModified: fx.updated_at ? new Date(fx.updated_at) : new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  const { data: teams } = await supabase.from("teams").select("id,updated_at").limit(200);
  for (const team of teams ?? []) {
    routes.push({
      url: `${base}/team/${team.id}`,
      lastModified: team.updated_at ? new Date(team.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    });
  }

  return routes;
}
