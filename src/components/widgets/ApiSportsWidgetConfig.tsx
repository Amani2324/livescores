"use client";

import { createElement } from "react";

/**
 * Global widget bootstrap (must exist once per page load).
 * @see https://api-sports.io/documentation/widgets/v3
 */
export function ApiSportsWidgetConfig({ apiKey }: { apiKey: string }) {
  return createElement("api-sports-widget", {
    "data-type": "config",
    "data-sport": "football",
    "data-key": apiKey,
    "data-lang": "en",
    "data-theme": "dark",
    "data-show-error": "false",
    "data-show-logos": "true",
    "data-refresh": "30",
    "data-favorite": "false",
    "data-tab": "games",
  });
}
