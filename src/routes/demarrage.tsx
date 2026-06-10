import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Users, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberField, TextField } from "@/components/simulator/assumptions-panel";
import { ScenarioManager } from "@/components/simulator/scenario-manager";
import { useSim } from "@/components/simulator/simulator-context";
import { nbAssociesEffectif, type Statut } from "@/components/simulator/use-simulator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demarrage")({
  head: () => ({
    meta: [
      { title: "Démarrage — Simulateur négoce VO" },
      { name: "description", content: "Identifiez le dirigeant, le nombre d'associés et le statut juridique de départ : la simulation se synchronise partout." },
      { property: "og:title", content: "Démarrage — Simulateur négoce VO" },
      { property: "og:description", content: "Profil de la société : dirigeant, associés, statut juridique." },
    ],
  }),
  component: DemarragePage,
});

const STATUTS: { v: Statut; label: string; desc: string }[] = [
  { v: "SAS", label: "SAS", desc: "Plusieurs associés, président assimilé salarié, dividendes à la flat tax. Recommandé pour ce projet." },
  { v: "SASU", label: "SASU", desc: "Unipersonnelle : un seul associé. Devient une SAS si d'autres associés rejoignent." },
  { v: "SARL", label: "SARL", desc: "Gérant majoritaire TNS : salaire moins chargé, mais dividendes pénalisés au-delà de 10 % du capital." },
];

function DemarragePage() {
  const { s, update } = useSim();
  const navigate = useNavigate();
  const nAssoc = nbAssociesEffectif(s);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="font-serif text-xl font-semibold">Démarrage de la simulation</h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Ces informations se synchronisent avec tout le simulateur — hypothèses, partie financière et juridique.
          Vous pourrez toujours les modifier ensuite dans l'onglet Hypothèses.
        </p>
      </div>

      {/* Dirigeant */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></span>
            <div>
              <h3 className="font-serif text-base font-semibold">Le dirigeant</h3>
              <p className="text-[11px] text-muted-foreground">Président (SAS / SASU) ou gérant (SARL).</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Prénom" value={s.dirigeantPrenom} set={update("dirigeantPrenom")} placeholder="ex. Samy" />
            <TextField label="Nom" value={s.dirigeantNom} set={update("dirigeantNom")} placeholder="ex. Dupont" />
          </div>
        </CardContent>
      </Card>

      {/* Statut juridique */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span>
            <div>
              <h3 className="font-serif text-base font-semibold">Statut juridique de départ</h3>
              <p className="text-[11px] text-muted-foreground">Modifiable à tout moment dans Hypothèses pour comparer.</p>
            </div>
          </div>
          <div role="radiogroup" aria-label="Statut juridique de départ" className="grid gap-2 sm:grid-cols-3">
            {STATUTS.map((st) => {
              const sel = s.statut === st.v;
              return (
                <button
                  key={st.v} type="button" role="radio" aria-checked={sel}
                  onClick={() => update("statut")(st.v)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    sel ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                  )}
                >
                  <div className={cn("font-serif text-sm font-semibold", sel ? "text-primary" : "text-foreground")}>{st.label}</div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{st.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Associés — sans objet en SASU (unipersonnelle) */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Users className="h-5 w-5" /></span>
            <div>
              <h3 className="font-serif text-base font-semibold">Les associés</h3>
              <p className="text-[11px] text-muted-foreground">Les dividendes sont partagés entre les associés.</p>
            </div>
          </div>
          {s.statut === "SASU" ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              SASU = société <strong>unipersonnelle</strong> : un seul associé, qui conserve l'intégralité des dividendes.
              Rien à saisir ici.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <NumberField label="Nombre d'associés" value={s.nbAssocies} set={update("nbAssocies")} min={2} max={10} step={1} unit="associés" />
              <p className="text-[11px] text-muted-foreground leading-snug pb-1">
                Pris en compte partout : revenu net du dirigeant, dividendes par associé, simulation juridique.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ScenarioManager />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button size="lg" className="gap-2" onClick={() => navigate({ to: "/synthese" })}>
          Lancer la simulation{nAssoc > 1 ? ` (${nAssoc} associés)` : ""}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Link to="/hypotheses" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          Régler d'abord les hypothèses →
        </Link>
      </div>
    </div>
  );
}
