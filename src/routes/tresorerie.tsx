import { createFileRoute } from "@tanstack/react-router";
import { TresorerieView } from "@/components/simulator/results";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/tresorerie")({
  head: () => ({
    meta: [
      { title: "Trésorerie — Simulateur négoce VO" },
      { name: "description", content: "Courbe de trésorerie mois par mois sur 12 mois, point bas et besoin de financement." },
      { property: "og:title", content: "Trésorerie — Simulateur négoce VO" },
      { property: "og:description", content: "Suivi mensuel de la trésorerie et point bas annuel." },
    ],
  }),
  component: () => <TresorerieView sim={useSim()} />,
});
