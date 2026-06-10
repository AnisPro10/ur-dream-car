import { createFileRoute } from "@tanstack/react-router";
import { CompteResultatView } from "@/components/simulator/results";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/compte-resultat")({
  head: () => ({
    meta: [
      { title: "Compte de résultat — Simulateur négoce VO" },
      { name: "description", content: "Détail du compte de résultat : marge brute, TVA, frais variables, charges fixes, IS, ratios et BFR." },
      { property: "og:title", content: "Compte de résultat — Simulateur négoce VO" },
      { property: "og:description", content: "Décomposition complète et ratios financiers du projet." },
    ],
  }),
  component: () => <CompteResultatView sim={useSim()} />,
});
