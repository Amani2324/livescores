import { createElement } from "react";
import { WidgetShell } from "@/components/widgets/WidgetShell";

/** Official games list; optional `leagueId` scopes to one competition. */
export function WidgetGames({
  title = "Games widget",
  leagueId,
}: {
  title?: string;
  leagueId?: number;
}) {
  const props: Record<string, string> = { "data-type": "games" };
  if (leagueId != null) props["data-league"] = String(leagueId);

  return (
    <WidgetShell
      title={title}
      subtitle="Powered by API-SPORTS widgets — live refresh from their CDN."
    >
      {createElement("api-sports-widget", props)}
    </WidgetShell>
  );
}
