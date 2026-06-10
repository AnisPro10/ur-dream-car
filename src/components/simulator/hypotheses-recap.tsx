import { Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSim } from "./simulator-context";

// Rappel compact des hypothèses courantes affiché sur toutes les pages sauf /hypotheses.
export function HypothesesRecap() {
  const { s, presetIntact } = useSim();
  const modeLabel = presetIntact ? (s.mode === "realiste" ? "Réaliste" : "Prudent") : "Personnalisé";
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">Hypothèses :</span>
        <Badge variant="secondary">{s.statut}</Badge>
        <Badge variant="secondary">{s.activite === "courtage" ? "Courtage" : "Stock"}</Badge>
        <Badge variant="secondary">Mode {modeLabel}</Badge>
        <Badge variant="secondary">{s.volume} {s.activite === "courtage" ? "mandats" : "v."}/an</Badge>
        <Badge variant="secondary">Mix {s.mixEg}% éco</Badge>
        <Badge variant="secondary">Capital {s.capital.toLocaleString("fr-FR")} €</Badge>
      </div>
      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
        <Link to="/hypotheses">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Modifier
        </Link>
      </Button>
    </div>
  );
}
