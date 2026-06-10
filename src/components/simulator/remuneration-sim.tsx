import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NumberField } from "./assumptions-panel";
import { simulerRemuneration, eur, pct, type Statut, type RemunResult } from "./use-simulator";
import { useSim } from "./simulator-context";

const STATUTS: Statut[] = ["SAS", "SASU", "SARL"];
const STRATEGIES = [
  { label: "Tout en dividendes", salaire: 0 },
  { label: "Salaire modéré", salaire: 12000 },
  { label: "Salaire élevé", salaire: 24000 },
];

type RowDef = { label: string; get: (r: RemunResult) => string; strong?: boolean; indent?: boolean; tone?: (r: RemunResult) => "good" | "bad" | undefined };

const ROWS: RowDef[] = [
  { label: "Coût du salaire (charges incl.)", get: (r) => eur(r.coutSalaire) },
  { label: "dont charges sociales", get: (r) => eur(r.chargesSoc), indent: true },
  { label: "dont cotis. min. (SARL)", get: (r) => (r.cotisMin > 0 ? eur(r.cotisMin) : "—"), indent: true },
  { label: "Base imposable (IS)", get: (r) => eur(r.baseIS) },
  { label: "− Impôt (IS)", get: (r) => eur(-r.is), indent: true },
  { label: "Bénéfice distribuable", get: (r) => eur(r.distribuable) },
  { label: "Dividendes nets (société)", get: (r) => eur(r.divNet) },
  { label: "Revenu net dirigeant", get: (r) => eur(r.revenuNetDirigeant), strong: true, tone: () => "good" },
  { label: "Taux de prélèvement global", get: (r) => pct(r.tauxPrelevement) },
];

export function RemunerationSim() {
  const { s } = useSim();
  const [benefice, setBenefice] = useState(30000);
  const [salaire, setSalaire] = useState(0);

  const results = useMemo(
    () => STATUTS.map((st) => simulerRemuneration(benefice, s.capital, st, salaire)),
    [benefice, salaire, s.capital],
  );
  const bestIdx = results.reduce((best, r, i) => (r.revenuNetDirigeant > results[best].revenuNetDirigeant ? i : best), 0);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-serif text-lg font-semibold mb-1">Simulation de rémunération — SAS / SASU / SARL</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Pour un bénéfice annuel avant rémunération donné, comment se payer le plus efficacement selon le statut ?
          Mêmes règles fiscales 2026 que le fichier Excel juridique (IS 15 %/25 %, flat tax 31,4 %, cotisations TNS &gt; 10 % du capital).
          Capital social : <strong>{eur(s.capital)}</strong> (modifiable dans Hypothèses).
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4 max-w-md">
          <NumberField label="Bénéfice avant rémunération" value={benefice} set={setBenefice} min={0} max={300000} step={1000} unit="€ / an" />
          <NumberField label="Rémunération nette / dirigeant" value={salaire} set={setSalaire} min={0} max={150000} step={1000} unit="€ / an" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium self-center mr-1">Stratégie rapide :</span>
          {STRATEGIES.map((st) => (
            <button
              key={st.label} type="button" onClick={() => setSalaire(st.salaire)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                salaire === st.salaire ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <caption className="sr-only">Comparaison de la rémunération du dirigeant selon le statut juridique</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left font-medium text-muted-foreground text-xs uppercase tracking-wider py-2 pr-3">Indicateur</th>
                {results.map((r, i) => (
                  <th key={r.statut} scope="col" className={cn("text-right py-2 px-3 align-bottom", i === bestIdx && "bg-success/5 rounded-t-md")}>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-serif text-sm font-semibold text-foreground">{r.statut}</span>
                      {i === bestIdx && <Badge variant="success" className="text-[9px] px-1.5 py-0">Mieux payé</Badge>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-border/60">
                  <th scope="row" className={cn("text-left font-normal py-2 pr-3", row.indent ? "pl-4 text-muted-foreground/80 text-xs" : "text-muted-foreground", row.strong && "text-foreground font-semibold")}>
                    {row.label}
                  </th>
                  {results.map((r, i) => {
                    const t = row.tone?.(r);
                    return (
                      <td key={r.statut} className={cn(
                        "text-right py-2 px-3 font-mono tabular-nums",
                        i === bestIdx && "bg-success/5",
                        row.strong ? "font-bold" : "font-medium",
                        t === "good" ? "text-success" : t === "bad" ? "text-destructive" : row.indent ? "text-muted-foreground" : "text-foreground",
                      )}>
                        {row.get(r)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
          Lecture : à bénéfice et capital identiques, la <strong>SASU</strong> conserve l'intégralité des dividendes (associé unique),
          là où la SAS et la SARL les partagent entre les trois associés. La SARL pénalise les dividendes au-delà de 10 % du capital
          (cotisations TNS). Simulation indicative — à valider avec un expert-comptable.
        </p>
      </CardContent>
    </Card>
  );
}
