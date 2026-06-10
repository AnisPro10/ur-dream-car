import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NumberField } from "./assumptions-panel";
import { simulerRemuneration, nbAssociesEffectif, eur, pct, type Statut, type RemunResult } from "./use-simulator";
import { useSim } from "./simulator-context";

const STATUTS: Statut[] = ["SAS", "SASU", "SARL"];
const STRATEGIES = [
  { label: "Tout en dividendes", salaire: 0 },
  { label: "Salaire modéré", salaire: 12000 },
  { label: "Salaire élevé", salaire: 24000 },
];

type RowDef = {
  label: string; get: (r: RemunResult) => string;
  strong?: boolean; indent?: boolean; tone?: (r: RemunResult) => "good" | "bad" | undefined;
};

export function RemunerationSim() {
  const { s } = useSim();
  const [benefice, setBenefice] = useState(30000);
  const [salaire, setSalaire] = useState(0);
  const [nbRemuneres, setNbRemuneres] = useState(1);

  // Nombre d'associés synchronisé avec le profil (Démarrage / Hypothèses).
  const nAssoc = nbAssociesEffectif(s);
  const remEffectif = salaire > 0 ? nbRemuneres : 0;

  const results = useMemo(
    () => STATUTS.map((st) =>
      simulerRemuneration(benefice, s.capital, st, salaire, {
        nbAssocies: s.nbAssocies,
        nbRemuneres: remEffectif,
      })),
    [benefice, salaire, remEffectif, s.capital, s.nbAssocies],
  );
  const bestIdx = results.reduce((best, r, i) => (r.revenuNetDirigeant > results[best].revenuNetDirigeant ? i : best), 0);

  const dirigeant = `${s.dirigeantPrenom} ${s.dirigeantNom}`.trim();
  const multiAssoc = results.some((r) => r.nAssoc > 1);

  const rows: RowDef[] = [
    { label: "Associés (dividendes partagés)", get: (r) => r.nAssoc === 1 ? "1 (unipersonnelle)" : String(r.nAssoc) },
    { label: "Associés rémunérés", get: (r) => (r.nbRemuneres === 0 ? "0 (tout en dividendes)" : String(r.nbRemuneres)) },
    { label: "Coût des salaires (charges incl.)", get: (r) => eur(r.coutSalaire) },
    { label: "dont salaires nets versés", get: (r) => (r.salaireTotal > 0 ? eur(r.salaireTotal) : "—"), indent: true },
    { label: "dont charges sociales", get: (r) => eur(r.chargesSoc), indent: true },
    { label: "dont cotis. min. (SARL)", get: (r) => (r.cotisMin > 0 ? eur(r.cotisMin) : "—"), indent: true },
    { label: "Base imposable (IS)", get: (r) => eur(r.baseIS) },
    { label: "− Impôt (IS)", get: (r) => eur(-r.is), indent: true },
    { label: "Bénéfice distribuable", get: (r) => eur(r.distribuable) },
    { label: "Dividendes nets (société)", get: (r) => eur(r.divNet) },
    { label: "Dividendes nets / associé", get: (r) => eur(r.divNet / r.nAssoc), indent: true },
    { label: "Revenu net dirigeant (salaire + div.)", get: (r) => eur(r.revenuNetDirigeant), strong: true, tone: () => "good" },
    ...(multiAssoc
      ? [{ label: "Revenu net / associé non rémunéré", get: (r: RemunResult) => (r.nAssoc > 1 ? eur(r.revenuAssocieNonRemunere) : "—") }]
      : []),
    { label: "Taux de prélèvement global", get: (r) => pct(r.tauxPrelevement) },
  ];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-serif text-lg font-semibold mb-1">Simulation de rémunération — SAS / SASU / SARL</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Pour un bénéfice annuel avant rémunération donné, comment payer
          {dirigeant ? <> le dirigeant (<strong>{dirigeant}</strong>)</> : " le dirigeant"} et les associés selon le statut ?
          Mêmes règles fiscales 2026 que le fichier Excel juridique (IS 15 %/25 %, flat tax 31,4 %, cotisations TNS &gt; 10 % du capital).
          Capital : <strong>{eur(s.capital)}</strong> · Associés : <strong>{nAssoc}</strong>
          {s.statut === "SASU" && " (SASU : unipersonnelle)"} — modifiables dans Démarrage / Hypothèses.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 max-w-2xl">
          <NumberField label="Bénéfice avant rémunération" value={benefice} set={setBenefice} min={0} max={300000} step={1000} unit="€ / an" />
          <NumberField label="Salaire net / associé rémunéré" value={salaire} set={setSalaire} min={0} max={150000} step={1000} unit="€ / an" />
          {salaire > 0 && nAssoc > 1 && (
            <NumberField
              label="Associés rémunérés" value={Math.min(nbRemuneres, nAssoc)} set={setNbRemuneres}
              min={1} max={nAssoc} step={1} unit={`/ ${nAssoc}`}
              hint="Les autres associés sont payés uniquement en dividendes."
            />
          )}
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
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="sr-only">Comparaison de la rémunération du dirigeant et des associés selon le statut juridique</caption>
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
              {rows.map((row) => (
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
          Lecture : la <strong>SASU</strong> n'a qu'un associé — il conserve l'intégralité des dividendes, sans partage.
          En <strong>SAS</strong> et <strong>SARL</strong>, les dividendes sont partagés entre les {nAssoc} associés ; le salaire ne va qu'aux associés rémunérés.
          La SARL pénalise les dividendes au-delà de 10 % du capital (cotisations TNS) et impose ~1 300 €/an de cotisations minimales au gérant non rémunéré.
          Simulation indicative — à valider avec un expert-comptable.
        </p>
      </CardContent>
    </Card>
  );
}
