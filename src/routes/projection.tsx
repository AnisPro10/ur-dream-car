import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NumberField } from "@/components/simulator/assumptions-panel";
import { projeter3ans, eur, type AnneeProjection } from "@/components/simulator/use-simulator";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/projection")({
  head: () => ({
    meta: [
      { title: "Projection 3 ans — Simulateur négoce VO" },
      { name: "description", content: "Projection pluriannuelle : montée en charge du volume, CFE dès l'année 2, ACRE année 1, trésorerie cumulée." },
      { property: "og:title", content: "Projection 3 ans — Simulateur négoce VO" },
      { property: "og:description", content: "Résultat net et trésorerie cumulée sur 3 ans." },
    ],
  }),
  component: ProjectionPage,
});

type RowDef = { label: string; get: (a: AnneeProjection) => string; strong?: boolean; tone?: (a: AnneeProjection) => "good" | "bad" | undefined };

const ROWS: RowDef[] = [
  { label: "Volume", get: (a) => `${a.volume}` },
  { label: "Chiffre d'affaires", get: (a) => eur(a.ca) },
  { label: "Contribution", get: (a) => eur(a.contribution), tone: (a) => (a.contribution >= 0 ? "good" : "bad") },
  { label: "CFE", get: (a) => (a.cfe > 0 ? eur(-a.cfe) : "exonérée") },
  { label: "ACRE (charges −50 %)", get: (a) => (a.acreActive ? "oui" : "—") },
  { label: "Résultat net société", get: (a) => eur(a.netSoc), strong: true, tone: (a) => (a.netSoc >= 0 ? "good" : "bad") },
  { label: "Revenu net dirigeant", get: (a) => eur(a.revenuDirigeant) },
  { label: "Trésorerie cumulée", get: (a) => eur(a.tresoCumulee), strong: true, tone: (a) => (a.tresoCumulee >= 0 ? "good" : "bad") },
];

function ProjectionPage() {
  const { s, update } = useSim();
  const years = useMemo(() => projeter3ans(s), [s]);
  const maxAbs = Math.max(1, ...years.map((y) => Math.abs(y.netSoc)));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-xl font-semibold">Projection sur 3 ans</h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Montée en charge du volume, CFE exonérée l'année 1 puis due, ACRE (−50 % de charges) la 1ʳᵉ année.
          Réglages synchronisés avec les hypothèses.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end max-w-xl">
        <NumberField label="Croissance du volume / an" value={s.croissance} set={update("croissance")} min={-50} max={200} step={5} unit="% / an" />
        <NumberField label="Volume année 1" value={s.volume} set={update("volume")} min={0} max={240} step={1} unit={s.activite === "courtage" ? "mandats" : "véh."} />
      </div>

      {/* Barres de résultat net par année (CSS, sans dépendance graphique) */}
      <Card>
        <CardContent className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Résultat net par année</div>
          <div className="flex items-end gap-6 h-44" role="img" aria-label="Résultat net société sur 3 ans">
            {years.map((y) => {
              const h = (Math.abs(y.netSoc) / maxAbs) * 100;
              const pos = y.netSoc >= 0;
              return (
                <div key={y.annee} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className={cn("mb-1 text-xs font-mono font-semibold tabular-nums", pos ? "text-success" : "text-destructive")}>{eur(y.netSoc)}</span>
                  <div className="w-full max-w-[72px] flex items-end justify-center" style={{ height: `${Math.max(4, h)}%` }}>
                    <div className={cn("w-full rounded-t-md", pos ? "bg-success" : "bg-destructive")} style={{ height: "100%" }} />
                  </div>
                  <span className="mt-2 text-xs font-medium text-muted-foreground">Année {y.annee}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tableau détaillé */}
      <Card>
        <CardContent className="p-5">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[460px] border-collapse text-sm">
              <caption className="sr-only">Projection du compte de résultat et de la trésorerie sur 3 ans</caption>
              <thead>
                <tr>
                  <th scope="col" className="text-left font-medium text-muted-foreground text-xs uppercase tracking-wider py-2 pr-3">Indicateur</th>
                  {years.map((y) => (
                    <th key={y.annee} scope="col" className="text-right py-2 px-3 font-serif text-sm font-semibold">Année {y.annee}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-border/60">
                    <th scope="row" className={cn("text-left font-normal py-2 pr-3", row.strong ? "text-foreground font-semibold" : "text-muted-foreground")}>{row.label}</th>
                    {years.map((y) => {
                      const t = row.tone?.(y);
                      return (
                        <td key={y.annee} className={cn(
                          "text-right py-2 px-3 font-mono tabular-nums",
                          row.strong ? "font-bold" : "font-medium",
                          t === "good" ? "text-success" : t === "bad" ? "text-destructive" : "text-foreground",
                        )}>
                          {row.get(y)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
            Trésorerie cumulée indicative : ressources de départ + résultat conservé chaque année (hors BFR, amortissement et décalage de TVA).
            Les dividendes ne sont distribués que sur un exercice bénéficiaire. À affiner avec un expert-comptable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
