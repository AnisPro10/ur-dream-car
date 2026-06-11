import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { projeter5ans, eur, num, type AnneeProjection } from "@/components/simulator/use-simulator";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/projection")({
  head: () => ({
    meta: [
      { title: "Projection 5 ans — Simulateur négoce VO" },
      { name: "description", content: "Projection sur 5 ans : croissance du volume et rémunération par année, CFE dès l'année 2, trésorerie cumulée. Parité avec l'Excel." },
      { property: "og:title", content: "Projection 5 ans — Simulateur négoce VO" },
      { property: "og:description", content: "Résultat net et trésorerie cumulée sur 5 ans." },
    ],
  }),
  component: ProjectionPage,
});

type RowDef = { label: string; get: (a: AnneeProjection) => string; strong?: boolean; tone?: (a: AnneeProjection) => "good" | "bad" | undefined };

const ROWS: RowDef[] = [
  { label: "Volume (véhicules)", get: (a) => num(a.volume, 1) },
  { label: "Chiffre d'affaires", get: (a) => eur(a.ca) },
  { label: "Contribution", get: (a) => eur(a.contribution), tone: (a) => (a.contribution >= 0 ? "good" : "bad") },
  { label: "CFE", get: (a) => (a.cfe > 0 ? eur(-a.cfe) : "exonérée") },
  { label: "Rémunération nette dirigeant", get: (a) => (a.remun > 0 ? eur(a.remun) : "—") },
  { label: "ACRE (charges −50 %)", get: (a) => (a.acreActive ? "oui" : "—") },
  { label: "Résultat net société", get: (a) => eur(a.netSoc), strong: true, tone: (a) => (a.netSoc >= 0 ? "good" : "bad") },
  { label: "Trésorerie cumulée", get: (a) => eur(a.tresoCumulee), strong: true, tone: (a) => (a.tresoCumulee >= 0 ? "good" : "bad") },
];

function ProjectionPage() {
  const { s } = useSim();
  const years = useMemo(() => projeter5ans(s), [s]);
  const maxAbs = Math.max(1, ...years.map((y) => Math.abs(y.netSoc)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold">Projection sur 5 ans</h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Croissance du volume et rémunération réglées année par année (comme l'Excel) : {s.croissance2} % · {s.croissance3} % · {s.croissance4} % · {s.croissance5} %.
            CFE exonérée l'année 1 puis due. Volume non arrondi — chiffres identiques à l'onglet Projection_5ans de l'Excel.
          </p>
        </div>
        <Link to="/hypotheses" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors shrink-0">
          Régler la projection →
        </Link>
      </div>

      {/* Barres de résultat net par année (CSS, sans dépendance graphique) */}
      <Card>
        <CardContent className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Résultat net par année</div>
          <div className="flex items-end gap-4 h-44" role="img" aria-label="Résultat net société sur 5 ans">
            {years.map((y) => {
              const h = (Math.abs(y.netSoc) / maxAbs) * 100;
              const pos = y.netSoc >= 0;
              return (
                <div key={y.annee} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className={cn("mb-1 text-[11px] font-mono font-semibold tabular-nums", pos ? "text-success" : "text-destructive")}>{eur(y.netSoc)}</span>
                  <div className="w-full max-w-[64px] flex items-end justify-center" style={{ height: `${Math.max(4, h)}%` }}>
                    <div className={cn("w-full rounded-t-md", pos ? "bg-success" : "bg-destructive")} style={{ height: "100%" }} />
                  </div>
                  <span className="mt-2 text-xs font-medium text-muted-foreground">An {y.annee}</span>
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
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">Projection du compte de résultat et de la trésorerie sur 5 ans</caption>
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
