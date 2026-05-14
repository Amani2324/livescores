export type PreviewLocale = "en" | "rn";

export interface PreviewModelInput {
  locale: PreviewLocale;
  homeName: string;
  awayName: string;
  leagueName: string;
  formHome: string;
  formAway: string;
  h2h: { homeWins: number; awayWins: number; draws: number; sample: number };
  rankHome?: number | null;
  rankAway?: number | null;
  pointsHome?: number | null;
  pointsAway?: number | null;
  goalsHomeAvg?: number | null;
  goalsAwayAvg?: number | null;
  predictionAdvice?: string | null;
}

const copy = {
  en: {
    title: (h: string, a: string) => `${h} vs ${a}: match preview`,
    intro: (league: string) => `League context: ${league}.`,
    form: (name: string, f: string) => `${name} recent form (last fixtures, W/D/L): ${f}.`,
    h2h: (h: string, a: string, s: PreviewModelInput["h2h"]) =>
      `Head-to-head (recent sample): ${h} wins ${s.homeWins}, draws ${s.draws}, ${a} wins ${s.awayWins} (n=${s.sample}).`,
    table: (h: string, a: string, rh: number, ra: number, ph: number, pa: number) =>
      `Standings snapshot: ${h} rank ${rh} (${ph} pts), ${a} rank ${ra} (${pa} pts).`,
    trends: (h: string, a: string, gh: number, ga: number) =>
      `Scoring rhythm (season averages where available): ${h} ~${gh.toFixed(
        2,
      )} goals scored per game, ${a} ~${ga.toFixed(2)}.`,
    bet: (t: string) => `Bettor note: ${t}`,
    rnPlaceholder:
      "(Kirundi translation hook) Inyandiko z'ikipe zizoshira hano mu rurimi rwa Kirundi.",
  },
  rn: {
    title: (h: string, a: string) => `${h} vs ${a}: incamake (Kirundi — placeholder)`,
    intro: (league: string) => `Shiraho: ${league}.`,
    form: (name: string, f: string) => `${name}: uburyo bw'imikino ${f}.`,
    h2h: (h: string, a: string, s: PreviewModelInput["h2h"]) =>
      `H2H: ${h} ${s.homeWins}, draw ${s.draws}, ${a} ${s.awayWins}.`,
    table: (h: string, a: string, rh: number, ra: number, ph: number, pa: number) =>
      `Table: ${h} #${rh} (${ph}), ${a} #${ra} (${pa}).`,
    trends: (h: string, a: string, gh: number, ga: number) =>
      `Goals: ${h} ${gh.toFixed(2)}, ${a} ${ga.toFixed(2)}.`,
    bet: (t: string) => `Amakuru: ${t}`,
    rnPlaceholder: "",
  },
};

export function buildPreviewTexts(input: PreviewModelInput) {
  const L = copy[input.locale] ?? copy.en;
  const title = L.title(input.homeName, input.awayName);
  const parts: string[] = [L.intro(input.leagueName), L.form(input.homeName, input.formHome), L.form(input.awayName, input.formAway), L.h2h(input.homeName, input.awayName, input.h2h)];

  if (
    input.rankHome != null &&
    input.rankAway != null &&
    input.pointsHome != null &&
    input.pointsAway != null
  ) {
    parts.push(
      L.table(
        input.homeName,
        input.awayName,
        input.rankHome,
        input.rankAway,
        input.pointsHome,
        input.pointsAway,
      ),
    );
  }

  const gh = Number.isFinite(input.goalsHomeAvg ?? NaN)
    ? (input.goalsHomeAvg as number)
    : 1.1;
  const ga = Number.isFinite(input.goalsAwayAvg ?? NaN)
    ? (input.goalsAwayAvg as number)
    : 1.1;
  parts.push(L.trends(input.homeName, input.awayName, gh, ga));

  if (input.locale === "en") {
    parts.push(copy.en.rnPlaceholder);
  }

  const body = parts.join(" ");

  const implied =
    input.predictionAdvice ??
    "Models disagree on short prices; check team news and lineups before kickoff.";
  const bettor = L.bet(implied);

  return { title, body, bettor_insights: bettor };
}
