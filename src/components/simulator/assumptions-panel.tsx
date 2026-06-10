import { useId } from "react";
import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Hypotheses, Mode, Activite } from "./use-simulator";
import { eur } from "./use-simulator";

type Props = {
  s: Hypotheses;
  update: <K extends keyof Hypotheses>(k: K) => (v: Hypotheses[K]) => void;
  reset: () => void;
  setPreset: (mode: Mode) => void;
  presetIntact: boolean;
};

function Row({
  label, value, set, min, max, step, fmt = eur,
}: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number; fmt?: (v: number) => string }) {
  const id = useId();
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <span id={id} className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-semibold text-primary tabular-nums">{fmt(value)}</span>
      </div>
      <Slider
        value={[value]} min={min} max={max} step={step}
        onValueChange={(v) => set(v[0])}
        aria-labelledby={id}
        ariaLabel={label}
        ariaValueText={fmt(value)}
      />
    </div>
  );
}

function Segmented<T extends string>({
  label, options, value, onChange, cols,
}: { label: string; options: { v: T; label: string }[]; value: T | null; onChange: (v: T) => void; cols: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid ${cols} gap-2`}>
      {options.map((o) => {
        const sel = value === o.v;
        return (
          <button
            key={o.v}
            role="radio"
            aria-checked={sel}
            onClick={() => onChange(o.v)}
            className={`h-9 rounded-md text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              sel ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function AssumptionsPanel({ s, update, reset, setPreset, presetIntact }: Props) {
  return (
    <Card className="h-fit">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold">Hypothèses</h2>
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs gap-1.5">
            <RotateCcw className="h-3 w-3" /> Réinitialiser
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Mode d'hypothèses</span>
            {!presetIntact && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Personnalisé</Badge>}
          </div>
          <Segmented<Mode>
            label="Mode d'hypothèses" cols="grid-cols-2"
            value={presetIntact ? s.mode : null}
            onChange={(md) => setPreset(md)}
            options={[{ v: "prudent", label: "Prudent" }, { v: "realiste", label: "Réaliste" }]}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
            Prudent = hypothèses du modèle audité. Réaliste = toutes les charges réelles (reconditionnement, assurance, diffusion, déplacements, décote).
          </p>
        </div>

        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Statut juridique</div>
          <Segmented
            label="Statut juridique" cols="grid-cols-3"
            value={s.statut}
            onChange={(st) => update("statut")(st)}
            options={[{ v: "SAS", label: "SAS" }, { v: "SASU", label: "SASU" }, { v: "SARL", label: "SARL" }]}
          />
        </div>

        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Modèle d'activité</div>
          <Segmented<Activite>
            label="Modèle d'activité" cols="grid-cols-2"
            value={s.activite}
            onChange={(a) => update("activite")(a)}
            options={[{ v: "stock", label: "Stock (achat-revente)" }, { v: "courtage", label: "Courtage (mandat)" }]}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
            Stock = vous achetez puis revendez (marge, BFR, garantie portée). Courtage = vous facturez une commission sans acheter le véhicule (sans stock, sans BFR).
          </p>
        </div>

        <Accordion type="multiple" defaultValue={["rem", "act"]} className="w-full">
          <AccordionItem value="rem">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Rémunération</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Rémunération nette dirigeant /an" value={s.remun} set={update("remun")} min={0} max={60000} step={1000} />
              <Row label="Part du résultat en dividendes" value={s.distrib} set={update("distrib")} min={0} max={100} step={5} fmt={(v) => v + " %"} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="eg">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Segment entrée de gamme</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Prix d'achat" value={s.achatEg} set={update("achatEg")} min={1500} max={8000} step={100} />
              <Row label="Prix de revente" value={s.reventeEg} set={update("reventeEg")} min={2000} max={10000} step={100} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ca">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Segment Crit'Air 2</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Prix d'achat" value={s.achatCa} set={update("achatCa")} min={5000} max={16000} step={250} />
              <Row label="Prix de revente" value={s.reventeCa} set={update("reventeCa")} min={6000} max={18000} step={250} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fv">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Frais variables / voiture</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Préparation" value={s.prep} set={update("prep")} min={0} max={800} step={25} />
              <Row label="Transport + carburant" value={s.transport} set={update("transport")} min={0} max={800} step={25} />
              <Row label="Provision garantie" value={s.garantie} set={update("garantie")} min={0} max={1500} step={25} />
              <Row label="Petits frais (CT, annonce…)" value={s.petits} set={update("petits")} min={0} max={400} step={5} />
              <Row label="Provision décote / invendus" value={s.decote} set={update("decote")} min={0} max={500} step={25} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cf">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Charges fixes & taxes</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Local / parking (mois)" value={s.local} set={update("local")} min={0} max={2000} step={50} />
              <Row label="Assurances (mois)" value={s.assur} set={update("assur")} min={0} max={800} step={25} />
              <Row label="Autres (mois)" value={s.autres} set={update("autres")} min={0} max={1000} step={25} />
              <Row label="CFE annuelle (0 = exonéré an 1)" value={s.cfe} set={update("cfe")} min={0} max={2000} step={50} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="act">
            <AccordionTrigger className="text-xs uppercase tracking-wider text-primary font-semibold">Activité & financement</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Row label="Volume annuel" value={s.volume} set={update("volume")} min={6} max={120} step={1} fmt={(v) => v + (s.activite === "courtage" ? " mandats" : " voit.")} />
              {s.activite === "courtage" && (
                <Row label="Commission moyenne / mandat" value={s.commission} set={update("commission")} min={200} max={2500} step={50} />
              )}
              <Row label="Part entrée de gamme" value={s.mixEg} set={update("mixEg")} min={0} max={100} step={5} fmt={(v) => v + " %"} />
              {s.activite === "stock" && (
                <>
                  <Row label="Délai de revente" value={s.rotation} set={update("rotation")} min={0.5} max={4} step={0.5} fmt={(v) => v + " mois"} />
                  <Row label="Achats en paiement après-vente" value={s.apresVente} set={update("apresVente")} min={0} max={100} step={5} fmt={(v) => v + " %"} />
                </>
              )}
              <Row label="Capital de départ" value={s.capital} set={update("capital")} min={5000} max={100000} step={1000} />
              <Row label="ARCE (capital France Travail)" value={s.arce} set={update("arce")} min={0} max={40000} step={500} />
              <Row label="Prêt d'honneur 0 % (IDF ≤ 25 000)" value={s.pretHonneur} set={update("pretHonneur")} min={0} max={50000} step={1000} />
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                ARCE = 60 % de vos droits ARE versés en capital. Le prêt d'honneur (Initiative / Réseau Entreprendre) finance la trésorerie sans intérêt. Ces ressources couvrent le besoin en fonds de roulement (BFR).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
