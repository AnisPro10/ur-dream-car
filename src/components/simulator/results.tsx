import {
  BarChart, Bar, Cell, CartesianGrid, LineChart, Line, ReferenceLine, ReferenceDot,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Wallet, Coins, Percent, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { eur, num, pct } from "./use-simulator";
import type { useSimulator } from "./use-simulator";

type Sim = ReturnType<typeof useSimulator>;
type Tone = "good" | "bad" | "neutral";

function Kpi({
  icon: Icon, label, value, sub, tone = "neutral", badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub?: string; tone?: Tone;
  badge?: { text: string; variant: "success" | "destructive" | "warning" | "secondary" };
}) {
  const text = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-foreground";
  const accent = tone === "good" ? "border-l-success" : tone === "bad" ? "border-l-destructive" : "border-l-primary";
  return (
    <Card className={cn("border-l-4", accent)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={cn("font-mono text-2xl font-semibold tabular-nums leading-tight", text)}>{value}</div>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
          {badge && <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">{badge.text}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      <Separator className="mt-2.5" />
    </div>
  );
}

function Row({
  label, value, strong, accent, indent, tone,
}: { label: string; value: string; strong?: boolean; accent?: boolean; indent?: boolean; tone?: "bad" | "good" }) {
  return (
    <div className={cn(
      "flex justify-between py-1.5 border-b border-border/60 last:border-0",
      indent && "pl-4", strong && "bg-muted/30 -mx-2 px-2 rounded",
    )}>
      <span className={cn("text-sm", strong ? "text-foreground font-semibold" : "text-muted-foreground")}>{label}</span>
      <span className={cn(
        "text-sm font-mono tabular-nums",
        tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : accent ? "text-primary" : strong ? "text-foreground" : "text-muted-foreground",
        strong ? "font-bold" : "font-medium",
      )}>
        {value}
      </span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  if (value == null) return null;
  const n = Number(value);
  const isPos = n >= 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</div>
      <div className={cn("font-mono text-sm font-semibold tabular-nums", isPos ? "text-success" : "text-destructive")}>{eur(n)}</div>
    </div>
  );
}

export function ResultsView({ sim }: { sim: Sim }) {
  const { s, m, cashOk } = sim;
  const lowPoint = m.treso.reduce((a, b) => (b.treso < a.treso ? b : a), m.treso[0]);

  return (
    <div className="space-y-10">
      {/* ===== SYNTHÈSE ===== */}
      <section id="synthese" className="scroll-mt-28 space-y-4">
        <SectionHead title="Synthèse" desc={`Scénario ${s.mode === "realiste" ? "réaliste" : "prudent"} · statut ${s.statut}`} />

        {!cashOk && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <TrendingDown className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Trésorerie négative en cours d'année (point bas <strong>{eur(m.pointBas)}</strong>). Augmentez le capital, réduisez le volume, accélérez la rotation ou activez le paiement après-vente.</span>
          </div>
        )}
        {m.remunInsoutenable && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Rémunération non finançable : son coût total (<strong>{eur(m.coutRemun)}</strong>) dépasse ce que l'activité dégage. La société paierait un salaire qu'elle ne génère pas.</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={Coins} label="Résultat net société" value={eur(m.netSoc)} sub="après rémunération"
            tone={m.netSoc > 0 ? "good" : "bad"} badge={{ text: m.netSoc > 0 ? "Bénéfice" : "Perte", variant: m.netSoc > 0 ? "success" : "destructive" }} />
          <Kpi icon={Wallet} label="Revenu net dirigeant" value={eur(m.revenuDirigeant)} sub={`salaire + ${m.nAssoc === 1 ? "dividendes" : "1/" + m.nAssoc + " dividendes"}`} />
          <Kpi icon={Percent} label="Marge nette" value={pct(m.tMargeNette)} sub={`brute ${pct(m.tMargeBrute)}`} tone={m.tMargeNette > 0 ? "good" : "bad"} />
          <Kpi icon={cashOk ? TrendingUp : TrendingDown} label="Point bas trésorerie" value={eur(m.pointBas)}
            tone={cashOk ? "good" : "bad"} badge={{ text: cashOk ? "Capital suffisant" : "Capital insuffisant", variant: cashOk ? "success" : "destructive" }} />
        </div>
      </section>

      {/* ===== COMPTE DE RÉSULTAT ===== */}
      <section id="resultat" className="scroll-mt-28">
        <SectionHead title="Compte de résultat & ratios" desc={`Structure ${s.statut} · contribution par voiture ${eur(m.contribParVoiture)}`} />
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardContent className="p-5">
              <Row label="Chiffre d'affaires" value={eur(m.ca)} strong />
              <Row label="− Coût d'achat" value={eur(-m.achats)} indent />
              <Row label="Marge brute" value={eur(m.margeBrute)} strong />
              <Row label="− TVA sur marge" value={eur(-m.tvaMarge)} indent />
              <Row label="− Frais variables" value={eur(-m.fraisVar)} indent />
              <Row label="Contribution" value={eur(m.contribution)} strong />
              <Row label="− Charges fixes" value={eur(-m.chargesFixesAn)} indent />
              <Row label="− CFE" value={eur(-s.cfe)} indent />
              <Row label="− Rémunération dirigeant" value={eur(-s.remun)} indent />
              <Row label="− Charges sociales" value={eur(-m.chargesSoc)} indent />
              {m.cotisMin > 0 && <Row label="− Cotisations min. (SARL)" value={eur(-m.cotisMin)} indent />}
              <Row label="− Impôt (IS)" value={eur(-m.is)} indent />
              <Row label="Résultat net société" value={eur(m.netSoc)} strong accent tone={m.netSoc < 0 ? "bad" : "good"} />
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardContent className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Revenu des associés</div>
                <Row label="Dividendes bruts distribués" value={eur(m.divBrut)} />
                <Row label="− Fiscalité dividendes" value={eur(-m.divFisc)} indent />
                <Row label="Dividendes nets (total)" value={eur(m.divNet)} strong />
                <Row label="Dividendes nets / associé" value={eur(m.divNet / m.nAssoc)} indent />
                <Row label="Résultat conservé (réinvesti)" value={eur(m.netConserve)} />
                <Row label="Revenu net dirigeant" value={eur(m.revenuDirigeant)} strong accent />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Ratios & BFR</div>
                <Row label="Taux de contribution" value={pct(m.tContribution)} />
                <Row label="Seuil de rentabilité (charges fixes)" value={num(m.seuilAn / 12, 2) + " v./mois"} />
                <Row label="Contribution / voiture" value={eur(m.contribParVoiture)} tone={m.contribParVoiture < 0 ? "bad" : undefined} />
                <Row label="Stock moyen (valeur)" value={eur(m.stockMoyen)} />
                <Row label="BFR financé par vous" value={eur(m.bfrFinance)} />
                <Row label="Rotation du stock" value={num(m.rotationStock, 1) + " ×/an"} />
                <Row label="ROI du capital" value={pct(m.roi)} accent tone={m.roi < 0 ? "bad" : "good"} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== TRÉSORERIE ===== */}
      <section id="tresorerie" className="scroll-mt-28">
        <SectionHead title="Trésorerie mois par mois" desc={`Point bas ${eur(m.pointBas)} au ${lowPoint?.mois}`} />
        <Card>
          <CardContent className="p-5">
            <div className="h-56" role="img" aria-label={`Courbe de trésorerie sur 12 mois, point bas ${eur(m.pointBas)}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={m.treso} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={(v) => v / 1000 + "k €"} width={52} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="var(--color-destructive)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="treso" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-chart-1)" }} activeDot={{ r: 5 }} />
                  {lowPoint && <ReferenceDot x={lowPoint.mois} y={lowPoint.treso} r={5} fill={cashOk ? "var(--color-success)" : "var(--color-destructive)"} stroke="white" />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ===== SCÉNARIOS ===== */}
      <section id="scenarios" className="scroll-mt-28">
        <SectionHead title="Résultat net selon le volume" desc="Après rémunération et IS. La barre encadrée = votre volume actuel ; vert = bénéfice, rouge = perte." />
        <Card>
          <CardContent className="p-5">
            <div className="h-52" role="img" aria-label="Résultat net selon le volume annuel de voitures">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.volScenarios} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="volume" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                  <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={(v) => v / 1000 + "k €"} width={52} />
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

      <p className="text-xs text-muted-foreground leading-relaxed">
        Modèle de gestion à but de simulation. Charges sociales : SAS / SASU ~80 % du net, SARL TNS ~45 % ; cotisations minimales SARL ≈ 1 300 €/an si non rémunéré.
        Dividendes : flat tax 31,4 % (2026), SARL au-delà de 10 % du capital ≈ 12,8 % IR + 45 % TNS. IS 15 % jusqu'à 42 500 € puis 25 %. À valider avec un expert-comptable.
      </p>
    </div>
  );
}
