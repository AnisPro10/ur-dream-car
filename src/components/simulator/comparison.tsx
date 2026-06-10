import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { computeModel, eur, pct, PRESETS } from "./use-simulator";
import type { Hypotheses, ModelResult } from "./use-simulator";

type Col = { key: string; label: string; sub: string; m: ModelResult; current: boolean };
type RowDef = {
  label: string;
  get: (m: ModelResult) => string;
  tone?: (m: ModelResult) => "good" | "bad" | undefined;
};

// Une ligne de comparaison : libellé à gauche, une valeur par colonne (scénario)
function CompareTable({ cols, rows, caption }: { cols: Col[]; rows: RowDef[]; caption: string }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="text-left font-medium text-muted-foreground text-xs uppercase tracking-wider py-2 pr-3 align-bottom">
              Indicateur
            </th>
            {cols.map((c) => (
              <th key={c.key} scope="col" className={cn(
                "text-right py-2 px-3 align-bottom",
                c.current && "bg-primary/5 rounded-t-md",
              )}>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-serif text-sm font-semibold text-foreground">{c.label}</span>
                  <span className="text-[10px] text-muted-foreground">{c.sub}</span>
                  {c.current && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Actuel</Badge>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border/60">
              <th scope="row" className="text-left font-normal text-muted-foreground py-2 pr-3">{r.label}</th>
              {cols.map((c) => {
                const t = r.tone?.(c.m);
                return (
                  <td key={c.key} className={cn(
                    "text-right py-2 px-3 font-mono tabular-nums font-medium",
                    c.current && "bg-primary/5",
                    t === "good" ? "text-success" : t === "bad" ? "text-destructive" : "text-foreground",
                  )}>
                    {r.get(c.m)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const METRICS: RowDef[] = [
  { label: "Résultat net société", get: (m) => eur(m.netSoc), tone: (m) => (m.netSoc > 0 ? "good" : "bad") },
  { label: "Revenu net dirigeant", get: (m) => eur(m.revenuDirigeant) },
  { label: "Marge nette", get: (m) => pct(m.tMargeNette), tone: (m) => (m.tMargeNette > 0 ? "good" : "bad") },
  { label: "Point bas trésorerie", get: (m) => eur(m.pointBas), tone: (m) => (m.pointBas >= 0 ? "good" : "bad") },
  { label: "Couverture du BFR", get: (m) => (m.financementOk ? "Financé" : "Insuffisant"), tone: (m) => (m.financementOk ? "good" : "bad") },
];

const isPrudentIntact = (s: Hypotheses) =>
  (Object.keys(PRESETS.prudent) as (keyof typeof PRESETS.prudent)[]).every((k) => s[k] === PRESETS.prudent[k]);
const isRealisteIntact = (s: Hypotheses) =>
  (Object.keys(PRESETS.realiste) as (keyof typeof PRESETS.realiste)[]).every((k) => s[k] === PRESETS.realiste[k]);

// Graphe « football field » : résultat net par variante, barres horizontales
// de part et d'autre d'une ligne zéro. CSS pur (pas de dépendance graphique).
function FootballField({ cols }: { cols: Col[] }) {
  const maxAbs = Math.max(1, ...cols.map((c) => Math.abs(c.m.netSoc)));
  return (
    <div className="mb-4 space-y-1.5" role="img" aria-label="Résultat net société par variante">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Résultat net société</div>
      {cols.map((c) => {
        const v = c.m.netSoc;
        const pos = v >= 0;
        const w = (Math.abs(v) / maxAbs) * 50;
        return (
          <div key={c.key} className="flex items-center gap-2 text-xs">
            <span className={cn("w-24 shrink-0 truncate", c.current ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {c.label} · {c.sub}
            </span>
            <div className="relative flex-1 h-5 rounded bg-muted/40">
              <div className="absolute inset-y-0 left-1/2 w-px bg-border" aria-hidden="true" />
              <div
                className={cn("absolute inset-y-1 rounded-sm", pos ? "bg-success" : "bg-destructive", c.current && "ring-2 ring-foreground/40")}
                style={pos ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
              />
            </div>
            <span className={cn("w-20 shrink-0 text-right font-mono tabular-nums", pos ? "text-success" : "text-destructive")}>{eur(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Comparison({ s }: { s: Hypotheses }) {
  // Bloc 1 : statut × mode (charges réelles), toutes les autres hypothèses figées sur l'état courant
  const variants: { key: string; statut: Hypotheses["statut"]; mode: "prudent" | "realiste" }[] = [
    { key: "prud-sas", statut: "SAS", mode: "prudent" },
    { key: "real-sas", statut: "SAS", mode: "realiste" },
    { key: "prud-sarl", statut: "SARL", mode: "prudent" },
    { key: "real-sarl", statut: "SARL", mode: "realiste" },
  ];
  const modeIntact = (mode: "prudent" | "realiste") => (mode === "prudent" ? isPrudentIntact(s) : isRealisteIntact(s));
  // computeModel est pur : on ne relance les 6 simulations que si `s` change réellement.
  const statutCols: Col[] = useMemo(
    () => variants.map((v) => ({
      key: v.key,
      label: v.statut,
      sub: v.mode === "prudent" ? "Prudent" : "Réaliste",
      m: computeModel({ ...s, statut: v.statut, mode: v.mode, ...PRESETS[v.mode] }),
      current: s.statut === v.statut && s.mode === v.mode && modeIntact(v.mode),
    })),
    [s],
  );

  // Bloc 2 : stock vs courtage, mode et statut courants — chiffre la voie recommandée
  const activiteCols: Col[] = useMemo(
    () => [
      { key: "stock", label: "Stock", sub: "Achat-revente", m: computeModel({ ...s, activite: "stock" }), current: s.activite === "stock" },
      { key: "courtage", label: "Courtage", sub: "Commission", m: computeModel({ ...s, activite: "courtage" }), current: s.activite === "courtage" },
    ],
    [s],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="mb-3">
            <h4 className="font-serif text-base font-semibold">Statut juridique × niveau de charges</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mêmes prix, volume et financement ; seuls le statut et le jeu d'hypothèses changent.
            </p>
          </div>
          <FootballField cols={statutCols} />
          <CompareTable cols={statutCols} rows={METRICS} caption="Comparaison par statut juridique et niveau de charges" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3">
            <h4 className="font-serif text-base font-semibold">Stock vs courtage</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              À statut et hypothèses identiques : le courtage supprime l'achat, le stock et le BFR. Voie de démarrage asset-light.
            </p>
          </div>
          <CompareTable cols={activiteCols} rows={METRICS} caption="Comparaison stock contre courtage" />
        </CardContent>
      </Card>
    </div>
  );
}
