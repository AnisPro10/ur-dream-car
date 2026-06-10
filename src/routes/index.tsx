import { createFileRoute } from "@tanstack/react-router";
import { SyntheseView } from "@/components/simulator/results";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Synthèse — Simulateur négoce VO" },
      { name: "description", content: "Vue d'ensemble : résultat net société, revenu dirigeant, marge nette et point bas de trésorerie." },
      { property: "og:title", content: "Synthèse — Simulateur négoce VO" },
      { property: "og:description", content: "Indicateurs clés du projet de négoce de véhicules d'occasion." },
    ],
  }),
  component: SynthesePage,
});

function SynthesePage() {
  const sim = useSim();
  return <SyntheseView sim={sim} />;
}
