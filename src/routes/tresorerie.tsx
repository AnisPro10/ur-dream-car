import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSim } from "@/components/simulator/simulator-context";

// Chargé en lazy : recharts (~115 kB gzip) n'est téléchargé qu'en ouvrant cette page.
const TresorerieView = lazy(() =>
  import("@/components/simulator/results-charts").then((m) => ({ default: m.TresorerieView })),
);

export const Route = createFileRoute("/tresorerie")({
  head: () => ({
    meta: [
      { title: "Trésorerie — Simulateur négoce VO" },
      { name: "description", content: "Courbe de trésorerie mois par mois sur 12 mois, point bas et besoin de financement." },
      { property: "og:title", content: "Trésorerie — Simulateur négoce VO" },
      { property: "og:description", content: "Suivi mensuel de la trésorerie et point bas annuel." },
    ],
  }),
  component: TresoreriePage,
});

function TresoreriePage() {
  const sim = useSim();
  return (
    <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted/40" />}>
      <TresorerieView sim={sim} />
    </Suspense>
  );
}
