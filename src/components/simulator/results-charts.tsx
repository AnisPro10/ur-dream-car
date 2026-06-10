import {
  BarChart, Bar, Cell, CartesianGrid, LineChart, Line, ReferenceLine, ReferenceDot,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { eur } from "./use-simulator";
import type { Sim } from "./simulator-context";
import { SectionHead } from "./results";

// recharts (~115 kB gzip) vit dans ce module à part : chargé en lazy uniquement
// par les pages /tresorerie et /scenarios, jamais par /synthese ni /compte-resultat.

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const isPos = n >= 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</div>
      <div className={cn("font-mono text-sm font-semibold tabular-nums", isPos ? "text-success" : "text-destructive")}>{eur(n)}</div>
    </div>
  );
}

const fmtK = (v: number) => (Number.isFinite(v) ? v / 1000 + "k €" : "");

export function TresorerieView({ sim }: { sim: Sim }) {
  const { m, cashOk } = sim;
  const lowPoint = m.treso.reduce((a, b) => (b.treso < a.treso ? b : a), m.treso[0]);
  // Même source de données que la courbe : le tableau reste synchronisé.
  const rows = m.treso.map((p, i) => ({
    mois: p.mois,
    treso: p.treso,
    delta: p.treso - (i === 0 ? m.ressources : m.treso[i - 1].treso),
    isLow: p.mois === lowPoint?.mois,
  }));
  return (
    <section>
      <SectionHead title="Trésorerie mois par mois" desc={`Départ ${eur(m.ressources)} · point bas ${eur(m.pointBas)} au ${lowPoint?.mois}`} />
      <Card>
        <CardContent className="p-5">
          <div className="h-72" role="img" aria-label={`Courbe de trésorerie sur 12 mois, point bas ${eur(m.pointBas)}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.treso} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="mois" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={fmtK} width={52} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="var(--color-destructive)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="treso" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-chart-1)" }} activeDot={{ r: 5 }} />
                {lowPoint && <ReferenceDot x={lowPoint.mois} y={lowPoint.treso} r={5} fill={cashOk ? "var(--color-success)" : "var(--color-destructive)"} stroke="white" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tableau d'évolution mensuelle, synchronisé avec la courbe ci-dessus */}
      <Card className="mt-5">
        <CardContent className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Détail mois par mois</div>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">Trésorerie de fin de mois et variation mensuelle sur 12 mois</caption>
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="text-left font-medium py-2 pr-3">Mois</th>
                  <th scope="col" className="text-right font-medium py-2 px-3">Trésorerie fin de mois</th>
                  <th scope="col" className="text-right font-medium py-2 pl-3">Variation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/60">
                  <th scope="row" className="text-left font-normal text-muted-foreground py-1.5 pr-3">Départ</th>
                  <td className="text-right py-1.5 px-3 font-mono tabular-nums text-foreground font-medium">{eur(m.ressources)}</td>
                  <td className="text-right py-1.5 pl-3 font-mono tabular-nums text-muted-foreground">—</td>
                </tr>
                {rows.map((r) => {
                  const d = Math.round(r.delta);
                  return (
                    <tr key={r.mois} className={cn("border-t border-border/60", r.isLow && "bg-destructive/5")}>
                      <th scope="row" className="text-left font-normal text-muted-foreground py-1.5 pr-3">
                        {r.mois}{r.isLow && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-destructive font-semibold">point bas</span>}
                      </th>
                      <td className={cn("text-right py-1.5 px-3 font-mono tabular-nums font-semibold", r.treso < 0 ? "text-destructive" : "text-foreground")}>{eur(r.treso)}</td>
                      <td className={cn("text-right py-1.5 pl-3 font-mono tabular-nums font-medium", d < 0 ? "text-destructive" : d > 0 ? "text-success" : "text-muted-foreground")}>
                        {d === 0 ? "—" : (d > 0 ? "+" : "−") + eur(Math.abs(d))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function ScenariosView({ sim }: { sim: Sim }) {
  const { m } = sim;
  return (
    <section>
      <SectionHead title="Résultat net selon le volume" desc="Après rémunération et IS. La barre encadrée = votre volume actuel ; vert = bénéfice, rouge = perte." />
      <Card>
        <CardContent className="p-5">
          <div className="h-72" role="img" aria-label="Résultat net selon le volume annuel de voitures">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.volScenarios} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="volume" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={fmtK} width={52} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                <ReferenceLine y={0} stroke="var(--color-border)" />
                <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                  {m.volScenarios.map((e) => (
                    <Cell key={e.volume} fill={e.net >= 0 ? "var(--color-success)" : "var(--color-destructive)"}
                      stroke={e.current ? "var(--color-foreground)" : undefined} strokeWidth={e.current ? 2 : 0} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
