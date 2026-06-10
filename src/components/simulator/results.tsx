import { TrendingDown, TrendingUp, Wallet, Coins, Percent, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { eur, num, pct } from "./use-simulator";
import { InfoTerm } from "./info-term";
import type { Sim } from "./simulator-context";

type Tone = "good" | "bad" | "neutral";

function Kpi({
  icon: Icon, label, value, sub, tone = "neutral", badge, term,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub?: string; tone?: Tone; term?: string;
  badge?: { text: string; variant: "success" | "destructive" | "warning" | "secondary" };
}) {
  const text = tone === "good" ? "text-success" : tone === "bad" ? "text-destructive" : "text-foreground";
  const accent = tone === "good" ? "border-l-success" : tone === "bad" ? "border-l-destructive" : "border-l-primary";
  return (
    <Card className={cn("border-l-4", accent)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{term ? <InfoTerm term={term}>{label}</InfoTerm> : label}</span>
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

export function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      <Separator className="mt-2.5" />
    </div>
  );
}

function Row({
  label, value, strong, accent, indent, tone, term,
}: { label: string; value: string; strong?: boolean; accent?: boolean; indent?: boolean; tone?: "bad" | "good"; term?: string }) {
  return (
    <div className={cn(
      "flex justify-between py-1.5 border-b border-border/60 last:border-0",
      indent && "pl-4", strong && "bg-muted/30 -mx-2 px-2 rounded",
    )}>
      <span className={cn("text-sm", strong ? "text-foreground font-semibold" : "text-muted-foreground")}>{term ? <InfoTerm term={term}>{label}</InfoTerm> : label}</span>
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

export function SyntheseView({ sim }: { sim: Sim }) {
  const { s, m, cashOk } = sim;
  return (
    <section className="space-y-4">
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
      {!m.courtage && !m.financementOk && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Besoin en fonds de roulement (<strong>{eur(m.bfrFinance)}</strong>) supérieur à vos ressources (<strong>{eur(m.ressources)}</strong> = capital + ARCE + prêt d'honneur). Ajoutez du capital, un prêt d'honneur, ou démarrez en courtage.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Coins} label="Résultat net société" term="Résultat net" value={eur(m.netSoc)} sub="après rémunération"
          tone={m.netSoc > 0 ? "good" : "bad"} badge={{ text: m.netSoc > 0 ? "Bénéfice" : "Perte", variant: m.netSoc > 0 ? "success" : "destructive" }} />
        <Kpi icon={Wallet} label="Revenu net dirigeant" value={eur(m.revenuDirigeant)} sub={`salaire + ${m.nAssoc === 1 ? "dividendes" : "1/" + m.nAssoc + " dividendes"}`} />
        <Kpi icon={Percent} label="Marge nette" term="Marge nette" value={pct(m.tMargeNette)} sub={`brute ${pct(m.tMargeBrute)}`} tone={m.tMargeNette > 0 ? "good" : "bad"} />
        <Kpi icon={cashOk ? TrendingUp : TrendingDown} label="Point bas trésorerie" term="Point bas de trésorerie" value={eur(m.pointBas)}
          tone={cashOk ? "good" : "bad"} badge={{ text: cashOk ? "Capital suffisant" : "Capital insuffisant", variant: cashOk ? "success" : "destructive" }} />
      </div>
    </section>
  );
}

export function CompteResultatView({ sim }: { sim: Sim }) {
  const { s, m } = sim;
  return (
    <section>
      <SectionHead title="Compte de résultat & ratios" desc={`Structure ${s.statut} · contribution par voiture ${eur(m.contribParVoiture)}`} />
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <Row label={m.courtage ? "Commissions encaissées" : "Chiffre d'affaires"} value={eur(m.ca)} strong />
            {!m.courtage && <Row label="− Coût d'achat" value={eur(-m.achats)} indent />}
            {!m.courtage && <Row label="Marge brute" value={eur(m.margeBrute)} strong />}
            <Row label={m.courtage ? "− TVA (20 % sur commission)" : "− TVA sur marge"} term="TVA sur marge" value={eur(-m.tvaMarge)} indent />
            <Row label="− Frais variables" term="Frais variables" value={eur(-m.fraisVar)} indent />
            <Row label="Contribution" term="Contribution" value={eur(m.contribution)} strong />
            <Row label="− Charges fixes" value={eur(-m.chargesFixesAn)} indent />
            <Row label="− CFE" value={eur(-s.cfe)} indent />
            <Row label="− Rémunération dirigeant" value={eur(-s.remun)} indent />
            <Row label="− Charges sociales" value={eur(-m.chargesSoc)} indent />
            {m.cotisMin > 0 && <Row label="− Cotisations min. (SARL)" term="TNS" value={eur(-m.cotisMin)} indent />}
            <Row label="− Impôt (IS)" term="IS" value={eur(-m.is)} indent />
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
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Ratios, BFR & financement</div>
              <Row label="Taux de contribution" value={pct(m.tContribution)} />
              <Row label="Seuil de rentabilité (charges fixes)" term="Seuil de rentabilité" value={num(m.seuilAn / 12, 2) + (m.courtage ? " mandats/mois" : " v./mois")} />
              <Row label={m.courtage ? "Contribution / mandat" : "Contribution / voiture"} value={eur(m.contribParVoiture)} tone={m.contribParVoiture < 0 ? "bad" : undefined} />
              {!m.courtage && <Row label="Stock moyen (valeur)" value={eur(m.stockMoyen)} />}
              {!m.courtage && <Row label="Rotation du stock" value={num(m.rotationStock, 1) + " ×/an"} />}
              <Row label="BFR à financer" term="BFR" value={m.courtage ? "0 € (sans stock)" : eur(m.bfrFinance)} tone={m.courtage ? "good" : undefined} />
              <Row label="Ressources (capital + ARCE + prêt)" value={eur(m.ressources)} />
              <Row label="Couverture du BFR" value={m.financementOk ? "Financé" : "Insuffisant"} tone={m.financementOk ? "good" : "bad"} accent />
              <Row label="ROI du capital" value={pct(m.roi)} accent tone={m.roi < 0 ? "bad" : "good"} />
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
        Modèle de gestion à but de simulation. Charges sociales : SAS / SASU ~80 % du net, SARL TNS ~45 % ; cotisations minimales SARL ≈ 1 300 €/an si non rémunéré.
        Dividendes : flat tax 31,4 % (2026), SARL au-delà de 10 % du capital ≈ 12,8 % IR + 45 % TNS. IS 15 % jusqu'à 42 500 € puis 25 %. À valider avec un expert-comptable.
      </p>
    </section>
  );
}
