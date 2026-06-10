import { createFileRoute } from "@tanstack/react-router";
import { BusinessModel } from "@/components/simulator/business-model";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business & juridique — Simulateur négoce VO" },
      { name: "description", content: "Modèle économique, statut juridique recommandé, étapes de démarrage et risques." },
      { property: "og:title", content: "Business & juridique — Simulateur négoce VO" },
      { property: "og:description", content: "Cadre du projet : business model, statut, fiscalité et étapes." },
    ],
  }),
  component: BusinessModel,
});
