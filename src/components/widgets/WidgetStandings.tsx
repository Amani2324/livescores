"use client";

import { createElement } from "react";
import { WidgetShell } from "@/components/widgets/WidgetShell";

export function WidgetStandings({
  leagueId,
  season,
  title = "Standings widget",
}: {
  leagueId: number;
  season: number;
  title?: string;
}) {
  return (
    <WidgetShell title={title} subtitle={`League ${leagueId} · season ${season}`}>
      {createElement("api-sports-widget", {
        "data-type": "standings",
        "data-league": String(leagueId),
        "data-season": String(season),
      })}
    </WidgetShell>
  );
}
