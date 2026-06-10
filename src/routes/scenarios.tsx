import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSim } from "@/components/simulator/simulator-context";

// Chargé en lazy : recharts (~115 kB gzip) n'est téléchargé qu'en ouvrant cette page.
const ScenariosView = lazy(() =>
  import("@/components/simulator/results-charts").then((m) => ({ default: m.ScenariosView })),
);

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scénarios de volume — Simulateur négoce VO" },
      { name: "description", content: "Résultat net selon le volume annuel de voitures vendues, après rémunération et IS." },
      { property: "og:title", content: "Scénarios de volume — Simulateur négoce VO" },
      { property: "og:description", content: "Sensibilité du résultat net au volume vendu." },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const sim = useSim();
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted/40" />}>
      <ScenariosView sim={sim} />
    </Suspense>
  );
}
