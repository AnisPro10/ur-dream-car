import { createFileRoute } from "@tanstack/react-router";
import { Comparison } from "@/components/simulator/comparison";
import { useSim } from "@/components/simulator/simulator-context";

export const Route = createFileRoute("/comparaison")({
  head: () => ({
    meta: [
      { title: "Comparaison de scénarios — Simulateur négoce VO" },
      { name: "description", content: "Côte à côte : statut juridique × niveau de charges, et stock vs courtage." },
      { property: "og:title", content: "Comparaison de scénarios — Simulateur négoce VO" },
      { property: "og:description", content: "Choisissez la structure et la voie de démarrage." },
    ],
  }),
  component: ComparaisonPage,
});

function ComparaisonPage() {
  const { s } = useSim();
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-serif text-xl font-semibold">Comparaison de scénarios</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Côte à côte, à hypothèses figées : choisissez la structure et la voie de démarrage.
        </p>
      </div>
      <Comparison s={s} />
    </section>
  );
}
