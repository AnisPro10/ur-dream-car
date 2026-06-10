import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssumptionsPanel } from "@/components/simulator/assumptions-panel";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/hypotheses")({
  head: () => ({
    meta: [
      { title: "Hypothèses — Simulateur négoce VO" },
      { name: "description", content: "Définissez prix, volume, mix gamme, statut juridique, rémunération, capital et financements." },
      { property: "og:title", content: "Hypothèses — Simulateur négoce VO" },
      { property: "og:description", content: "Paramètres du modèle : commerciaux, structure, fiscalité, financement." },
    ],
  }),
  component: HypothesesPage,
});

function HypothesesPage() {
  const sim = useSim();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold">Hypothèses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Saisissez ici prix, volume, structure et financement. Les autres pages se mettent à jour en temps réel.
          </p>
        </div>
        <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
          <Link to="/synthese">
            Voir la synthèse
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <AssumptionsPanel
        s={sim.s}
        update={sim.update}
        reset={sim.reset}
        setPreset={sim.setPreset}
        presetIntact={sim.presetIntact}
      />
    </div>
  );
}
