import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Négoce de véhicules d'occasion — Confiance & garantie en Île-de-France" },
      { name: "description", content: "Achat-revente de véhicules d'occasion vérifiés en Île-de-France : papiers en règle, contrôle expliqué, accompagnement. Accédez au simulateur financier du projet." },
      { property: "og:title", content: "Négoce de véhicules d'occasion — Confiance & garantie" },
      { property: "og:description", content: "Occasion vérifiée, papiers en règle, accompagnement. Et un simulateur financier complet : marge, trésorerie, fiscalité, scénarios." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});
