import { createFileRoute } from "@tanstack/react-router";
import { ScenariosView } from "@/components/simulator/results";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scénarios de volume — Simulateur négoce VO" },
      { name: "description", content: "Résultat net selon le volume annuel de voitures vendues, après rémunération et IS." },
      { property: "og:title", content: "Scénarios de volume — Simulateur négoce VO" },
      { property: "og:description", content: "Sensibilité du résultat net au volume vendu." },
    ],
  }),
  component: () => <ScenariosView sim={useSim()} />,
});
