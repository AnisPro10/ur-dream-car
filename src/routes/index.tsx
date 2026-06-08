import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulator } from "@/components/simulator/use-simulator";
import { AssumptionsPanel } from "@/components/simulator/assumptions-panel";
import { ResultsView } from "@/components/simulator/results";
import { BusinessModel } from "@/components/simulator/business-model";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulateur — Négoce de véhicules d'occasion" },
      { name: "description", content: "Simulateur financier et business model pour un projet d'achat-revente de véhicules d'occasion : marge, trésorerie, fiscalité SAS/SARL." },
      { property: "og:title", content: "Simulateur — Négoce de véhicules d'occasion" },
      { property: "og:description", content: "Simulateur financier interactif : marge, trésorerie, BFR, fiscalité SAS vs SARL." },
    ],
  }),
  component: SimulatorPage,
});

function SimulatorPage() {
  const sim = useSimulator();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <header className="border-b border-primary/30 pb-5 mb-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-medium">Projet entrepreneurial</div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-2 tracking-tight">
            Négoce de véhicules d'occasion
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Simulateur financier interactif et business model — ajustez les hypothèses, visualisez la trésorerie, comparez les structures juridiques.
          </p>
        </header>

        <Tabs defaultValue="sim" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sim">Simulateur financier</TabsTrigger>
            <TabsTrigger value="bm">Business model & stratégie</TabsTrigger>
          </TabsList>

          <TabsContent value="sim" className="mt-0">
            <div className="grid lg:grid-cols-[340px_1fr] gap-6">
              <AssumptionsPanel s={sim.s} update={sim.update} reset={sim.reset} />
              <ResultsView sim={sim} />
            </div>
          </TabsContent>

          <TabsContent value="bm" className="mt-0">
            <BusinessModel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
