type SportsEventJsonLd = Record<string, unknown>;

export function buildMatchSportsEventJsonLd(
  siteUrl: string,
  fixture: { id: number; date: string; venue_name?: string | null; venue_city?: string | null; home_team_name: string; away_team_name: string; status_short: string; goals_home: number; goals_away: number },
): SportsEventJsonLd {
  const url = `${siteUrl}/match/${fixture.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${fixture.home_team_name} vs ${fixture.away_team_name}`,
    startDate: fixture.date,
    eventStatus: "https://schema.org/EventScheduled",
    location: fixture.venue_name
      ? {
          "@type": "Place",
          name: fixture.venue_name,
          address: fixture.venue_city ?? undefined,
        }
      : undefined,
    competitor: [
      { "@type": "SportsTeam", name: fixture.home_team_name },
      { "@type": "SportsTeam", name: fixture.away_team_name },
    ],
    url,
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
