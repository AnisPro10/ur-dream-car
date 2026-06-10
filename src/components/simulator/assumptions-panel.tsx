import { useEffect, useId, useState } from "react";
import { RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Hypotheses, Mode, Activite } from "./use-simulator";

type Props = {
  s: Hypotheses;
  update: <K extends keyof Hypotheses>(k: K) => (v: Hypotheses[K]) => void;
  reset: () => void;
  setPreset: (mode: Mode) => void;
  presetIntact: boolean;
};

// Champ numérique professionnel : saisie au clavier + pas à pas (−/+), unité, bornes.
export function NumberField({
  label, value, set, min, max, step, unit, hint,
}: {
  label: string; value: number; set: (v: number) => void;
  min: number; max: number; step: number; unit?: string; hint?: string;
}) {
  const id = useId();
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);
  // Resynchronise depuis le modèle (reset, préréglage) seulement hors saisie active.
  useEffect(() => { if (!focused) setRaw(String(value)); }, [value, focused]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const parse = (str: string) => parseFloat(str.replace(",", "."));
  const onChange = (str: string) => {
    setRaw(str);
    const n = parse(str);
    if (!Number.isNaN(n)) set(clamp(n));
  };
  const nudge = (dir: number) => {
    const base = clamp(Number.isNaN(parse(raw)) ? value : parse(raw));
    const n = clamp(Math.round((base + dir * step) / step) * step);
    set(n); setRaw(String(n));
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-foreground/80">{label}</label>
      <div className="flex items-stretch h-9 rounded-md border border-input bg-background overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-ring">
        <button
          type="button" tabIndex={-1} aria-label={`Diminuer ${label}`} onClick={() => nudge(-1)}
          className="px-2 grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          id={id} type="number" inputMode="decimal" value={raw}
          min={min} max={max} step={step}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setRaw(String(value)); }}
          className="min-w-0 flex-1 bg-transparent px-1 text-center text-sm font-mono font-semibold tabular-nums text-foreground outline-none border-x border-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && <span className="px-2 grid place-items-center text-[11px] text-muted-foreground whitespace-nowrap select-none">{unit}</span>}
        <button
          type="button" tabIndex={-1} aria-label={`Augmenter ${label}`} onClick={() => nudge(1)}
          className="px-2 grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-l border-input"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hint && <p className="text-[10px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

// Champ texte simple (nom, prénom…) assorti au style des champs numériques.
export function TextField({
  label, value, set, placeholder, maxLength = 60,
}: { label: string; value: string; set: (v: string) => void; placeholder?: string; maxLength?: number }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-foreground/80">{label}</label>
      <input
        id={id} type="text" value={value} placeholder={placeholder} maxLength={maxLength}
        onChange={(e) => set(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
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
            key={o.v} type="button" role="radio" aria-checked={sel} onClick={() => onChange(o.v)}
            className={cn(
              "h-9 rounded-md text-sm font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              sel ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-muted",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Rubrique dépliée : titre + grille de champs (plus d'accordéon à ouvrir).
function Section({
  title, desc, children, action,
}: { title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif text-base font-semibold">{title}</h3>
            {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">{children}</div>
);

export function AssumptionsPanel({ s, update, reset, setPreset, presetIntact }: Props) {
  const courtage = s.activite === "courtage";

  return (
    <div className="space-y-5">
      {/* 1 · Structure & scénario */}
      <Section
        title="Structure & scénario"
        desc="Choisissez le préréglage de charges, le statut juridique et le modèle d'activité."
        action={
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-xs gap-1.5 shrink-0">
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        }
      >
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Préréglage des charges</span>
              {!presetIntact && <Badge variant="warning" className="text-[10px] px-1.5 py-0">Personnalisé</Badge>}
            </div>
            <Segmented<Mode>
              label="Préréglage des charges" cols="grid-cols-2"
              value={presetIntact ? s.mode : null}
              onChange={(md) => setPreset(md)}
              options={[{ v: "prudent", label: "Prudent" }, { v: "realiste", label: "Réaliste" }]}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              Prudent = modèle audité. Réaliste = toutes les charges réelles.
            </p>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Statut juridique</span>
            <Segmented
              label="Statut juridique" cols="grid-cols-3"
              value={s.statut}
              onChange={(st) => update("statut")(st)}
              options={[{ v: "SAS", label: "SAS" }, { v: "SASU", label: "SASU" }, { v: "SARL", label: "SARL" }]}
            />
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Modèle d'activité</span>
            <Segmented<Activite>
              label="Modèle d'activité" cols="grid-cols-2"
              value={s.activite}
              onChange={(a) => update("activite")(a)}
              options={[{ v: "stock", label: "Stock" }, { v: "courtage", label: "Courtage" }]}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              {courtage ? "Commission sans achat : sans stock ni BFR." : "Achat puis revente : marge, stock, BFR."}
            </p>
          </div>
        </div>

        {/* Profil de la société — synchronisé avec Démarrage, la sim juridique et tout le simulateur */}
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextField label="Prénom du dirigeant" value={s.dirigeantPrenom} set={update("dirigeantPrenom")} placeholder="ex. Samy" />
          <TextField label="Nom du dirigeant" value={s.dirigeantNom} set={update("dirigeantNom")} placeholder="ex. Dupont" />
          {s.statut !== "SASU" ? (
            <NumberField label="Nombre d'associés" value={s.nbAssocies} set={update("nbAssocies")} min={2} max={10} step={1} unit="associés" hint="Les dividendes sont partagés entre eux." />
          ) : (
            <div className="self-end pb-1 text-[11px] text-muted-foreground leading-snug">
              SASU = société unipersonnelle : un seul associé, pas de partage de dividendes.
            </div>
          )}
        </div>
      </Section>

      {/* 2 · Paramètres commerciaux */}
      <Section title="Paramètres commerciaux" desc={courtage ? "Volume de mandats et commission moyenne." : "Volume, mix de gamme, prix d'achat et de revente, rotation."}>
        <Grid>
          <NumberField label="Volume annuel" value={s.volume} set={update("volume")} min={0} max={240} step={1} unit={courtage ? "mandats/an" : "véh./an"} />
          {courtage ? (
            <NumberField label="Commission moyenne" value={s.commission} set={update("commission")} min={0} max={5000} step={50} unit="€ / mandat" />
          ) : (
            <>
              <NumberField label="Part entrée de gamme" value={s.mixEg} set={update("mixEg")} min={0} max={100} step={5} unit="%" hint="Le reste = Crit'Air 2." />
              <NumberField label="Achat — entrée de gamme" value={s.achatEg} set={update("achatEg")} min={0} max={20000} step={100} unit="€" />
              <NumberField label="Revente — entrée de gamme" value={s.reventeEg} set={update("reventeEg")} min={0} max={25000} step={100} unit="€" />
              <NumberField label="Achat — Crit'Air 2" value={s.achatCa} set={update("achatCa")} min={0} max={30000} step={250} unit="€" />
              <NumberField label="Revente — Crit'Air 2" value={s.reventeCa} set={update("reventeCa")} min={0} max={35000} step={250} unit="€" />
              <NumberField label="Délai de revente" value={s.rotation} set={update("rotation")} min={0.5} max={6} step={0.5} unit="mois" />
              <NumberField label="Paiement après-vente" value={s.apresVente} set={update("apresVente")} min={0} max={100} step={5} unit="%" hint="Part des achats réglés après revente." />
            </>
          )}
        </Grid>
      </Section>

      {/* 3 · Coûts */}
      <Section title="Coûts par véhicule & charges fixes" desc="Frais variables (par véhicule) et charges fixes mensuelles.">
        <Grid>
          <NumberField label="Préparation" value={s.prep} set={update("prep")} min={0} max={2000} step={25} unit="€ / véh." />
          <NumberField label="Transport + carburant" value={s.transport} set={update("transport")} min={0} max={2000} step={25} unit="€ / véh." />
          <NumberField label="Provision garantie" value={s.garantie} set={update("garantie")} min={0} max={3000} step={25} unit="€ / véh." />
          <NumberField label="Petits frais (CT, annonce…)" value={s.petits} set={update("petits")} min={0} max={1000} step={5} unit="€ / véh." />
          <NumberField label="Provision décote / invendus" value={s.decote} set={update("decote")} min={0} max={1000} step={25} unit="€ / véh." />
          <NumberField label="Local / parking" value={s.local} set={update("local")} min={0} max={5000} step={50} unit="€ / mois" />
          <NumberField label="Assurances" value={s.assur} set={update("assur")} min={0} max={2000} step={25} unit="€ / mois" />
          <NumberField label="Autres charges fixes" value={s.autres} set={update("autres")} min={0} max={3000} step={25} unit="€ / mois" />
          <NumberField label="CFE annuelle" value={s.cfe} set={update("cfe")} min={0} max={3000} step={50} unit="€ / an" hint="0 = exonéré l'année 1." />
        </Grid>
      </Section>

      {/* 4 · Rémunération & financement */}
      <Section title="Rémunération & financement" desc="Salaire du dirigeant, distribution de dividendes, capital et aides au démarrage.">
        <Grid>
          <NumberField label="Rémunération nette dirigeant" value={s.remun} set={update("remun")} min={0} max={120000} step={1000} unit="€ / an" />
          <NumberField label="Part du résultat en dividendes" value={s.distrib} set={update("distrib")} min={0} max={100} step={5} unit="%" />
          <NumberField label="Capital de départ" value={s.capital} set={update("capital")} min={0} max={200000} step={1000} unit="€" />
          <NumberField label="ARCE (capital France Travail)" value={s.arce} set={update("arce")} min={0} max={60000} step={500} unit="€" hint="60 % des droits ARE en capital." />
          <NumberField label="Prêt d'honneur 0 %" value={s.pretHonneur} set={update("pretHonneur")} min={0} max={50000} step={1000} unit="€" hint="IDF : jusqu'à 25 000 €." />
        </Grid>
      </Section>
    </div>
  );
}
