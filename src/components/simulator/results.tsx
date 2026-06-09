import {
  BarChart, Bar, Cell, CartesianGrid, LineChart, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Wallet, Coins, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { eur, num, pct } from "./use-simulator";
import type { useSimulator } from "./use-simulator";

type Sim = ReturnType<typeof useSimulator>;

function Kpi({
  icon: Icon, label, value, sub, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad";
}) {
  const toneClass = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className={cn("font-mono text-2xl font-semibold tabular-nums leading-tight", toneClass)}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Row({
  label, value, strong, accent, indent, tone,
}: { label: string; value: string; strong?: boolean; accent?: boolean; indent?: boolean; tone?: "bad" }) {
  return (
    <div className={cn("flex justify-between py-1.5 border-b border-border/60 last:border-0", indent && "pl-4")}>
      <span className={cn("text-sm", strong ? "text-foreground font-semibold" : "text-muted-foreground")}>{label}</span>
      <span className={cn(
        "text-sm font-mono tabular-nums",
        tone === "bad" ? "text-destructive" : accent ? "text-primary" : strong ? "text-foreground" : "text-muted-foreground",
        strong ? "font-bold" : "font-medium"
      )}>
        {value}
      </span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  if (value == null) return null;
  const n = Number(value);
  const isPos = n >= 0;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</div>
      <div className={cn("font-mono text-sm font-semibold tabular-nums", isPos ? "text-success" : "text-destructive")}>
        {eur(n)}
      </div>
    </div>
  );
}

export function ResultsView({ sim }: { sim: Sim }) {
  const { s, m, cashOk } = sim;
  const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  return (
    <div className="space-y-5">
      {!cashOk && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TrendingDown className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Trésorerie négative en cours d'année (point bas <strong>{eur(m.pointBas)}</strong>).
            Augmentez le capital, réduisez le volume, accélérez la rotation ou activez le paiement après-vente.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Coins} label="Résultat net société" value={eur(m.netSoc)} sub="après rémunération" tone={m.netSoc > 0 ? "good" : "bad"} />
        <Kpi icon={Wallet} label="Revenu net dirigeant" value={eur(m.revenuDirigeant)} sub="salaire + 1/3 dividendes" />
        <Kpi icon={Percent} label="Marge nette" value={pct(m.tMargeNette)} sub={`brute ${pct(m.tMargeBrute)}`} />
        <Kpi icon={TrendingUp} label="Point bas trésorerie" value={eur(m.pointBas)} sub={cashOk ? "capital suffisant ✓" : "capital insuffisant"} tone={cashOk ? "good" : "bad"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">Compte de résultat <span className="text-muted-foreground font-sans text-xs font-normal">({s.statut})</span></CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
            <Row label="Résultat net société" value={eur(m.netSoc)} strong accent tone={m.netSoc < 0 ? "bad" : undefined} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Revenu des associés</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Row label="Dividendes bruts distribués" value={eur(m.divBrut)} />
              <Row label="− Fiscalité dividendes" value={eur(-m.divFisc)} indent />
              <Row label="Dividendes nets (total)" value={eur(m.divNet)} strong />
              <Row label="Dividendes nets / associé" value={eur(m.divNet / 3)} indent />
              <Row label="Résultat conservé (réinvesti)" value={eur(m.netConserve)} />
              <Row label="Revenu net dirigeant" value={eur(m.revenuDirigeant)} strong accent />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Ratios & BFR</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Row label="Taux de contribution" value={pct(m.tContribution)} />
              <Row label="Seuil de rentabilité" value={num(m.seuilAn / 12, 2) + " v./mois"} />
              <Row label="Contribution / voiture" value={eur(m.contribParVoiture)} />
              <Row label="Stock moyen (valeur)" value={eur(m.stockMoyen)} />
              <Row label="BFR financé par vous" value={eur(m.bfrFinance)} />
              <Row label="Rotation du stock" value={num(m.rotationStock, 1) + " ×/an"} />
              <Row label="ROI du capital" value={pct(m.roi)} accent />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base">Trésorerie mois par mois</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={m.treso} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="mois" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={(v) => v / 1000 + "k"} width={42} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="var(--color-destructive)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="treso" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-chart-1)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="font-serif text-base">Résultat net selon le volume</CardTitle>
          <p className="text-xs text-muted-foreground">Après rémunération et IS. La barre encadrée correspond à votre volume actuel.</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.volScenarios} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="volume" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} stroke="var(--color-border)" tickFormatter={(v) => v / 1000 + "k"} width={42} />
                <Tooltip formatter={(v: unknown) => eur(Number(v))} contentStyle={tooltipStyle} labelStyle={{ color: "var(--color-primary)" }} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                  {m.volScenarios.map((e, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} stroke={e.current ? "var(--color-foreground)" : undefined} strokeWidth={e.current ? 2 : 0} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Modèle de gestion à but de simulation. Charges sociales : SAS ~80 % du net, SARL TNS ~45 % ; cotisations minimales SARL 1 200 €/an si non rémunéré.
        Dividendes : flat tax 30 %, + ~45 % en SARL au-delà de 10 % du capital. IS 15 % jusqu'à 42 500 € puis 25 %. À valider avec un expert-comptable.
      </p>
    </div>
  );
}
