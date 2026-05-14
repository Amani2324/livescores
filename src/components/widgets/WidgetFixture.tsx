"use client";

import { createElement } from "react";
import { WidgetShell } from "@/components/widgets/WidgetShell";

/** Full match widget (lineups, stats, events) for one API fixture id. */
export function WidgetFixture({ fixtureId, title = "Match widget" }: { fixtureId: number; title?: string }) {
  return (
    <WidgetShell title={title} subtitle="Official API-SPORTS match panel.">
      {createElement("api-sports-widget", {
        "data-type": "game",
        "data-game-id": String(fixtureId),
      })}
    </WidgetShell>
  );
}
