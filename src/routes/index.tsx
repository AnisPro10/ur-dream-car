import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, FileText, LineChart, BarChart3, Columns3, Briefcase, Link2, Check, Printer } from "lucide-react";
import { useSimulator, eur } from "@/components/simulator/use-simulator";
import { AssumptionsPanel } from "@/components/simulator/assumptions-panel";
import { ResultsView } from "@/components/simulator/results";
import { Comparison } from "@/components/simulator/comparison";
import { BusinessModel } from "@/components/simulator/business-model";
import { useScrollSpy, scrollToSection } from "@/components/simulator/use-scrollspy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulateur — Négoce de véhicules d'occasion" },
      { name: "description", content: "Simulateur financier et business model pour un projet d'achat-revente de véhicules d'occasion : marge, trésorerie, fiscalité SAS/SASU/SARL." },
      { property: "og:title", content: "Simulateur — Négoce de véhicules d'occasion" },
      { property: "og:description", content: "Simulateur financier interactif : marge, trésorerie, BFR, fiscalité SAS vs SARL." },
    ],
  }),
  component: SimulatorPage,
});

const SECTIONS = [
  { id: "synthese", label: "Synthèse", icon: LayoutDashboard },
  { id: "resultat", label: "Compte de résultat", icon: FileText },
  { id: "tresorerie", label: "Trésorerie", icon: LineChart },
  { id: "scenarios", label: "Scénarios", icon: BarChart3 },
  { id: "comparaison", label: "Comparaison", icon: Columns3 },
  { id: "business", label: "Business & juridique", icon: Briefcase },
] as const;

// Bouton de partage : copie un lien encodant l'état complet de la simulation
function ShareBar({ shareLink }: { shareLink: () => string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      const url = shareLink();
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
      else window.prompt("Copiez ce lien :", url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  return (
    <div className="flex items-center gap-1.5 print:hidden">
      <Button variant="outline" size="sm" onClick={copy} className="h-8 gap-1.5 text-xs" aria-live="polite">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Link2 className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{copied ? "Lien copié" : "Copier le lien"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 gap-1.5 text-xs">
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Imprimer · PDF</span>
      </Button>
    </div>
  );
}

function SimulatorPage() {
  const sim = useSimulator();
  const { s, m, cashOk, presetIntact } = sim;
  const active = useScrollSpy(SECTIONS.map((x) => x.id));
  const modeLabel = presetIntact ? (s.mode === "realiste" ? "Réaliste" : "Prudent") : "Personnalisé";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Barre de contexte (sticky) */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="max-w-[1500px] mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold hidden sm:inline">Simulateur</span>
            <h1 className="font-serif text-base font-semibold truncate">Négoce de véhicules d'occasion</h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="hidden sm:inline-flex">Statut : {s.statut}</Badge>
            <Badge variant="secondary" className="hidden sm:inline-flex">Mode : {modeLabel}</Badge>
            <Badge variant={m.netSoc > 0 ? "success" : "destructive"}>{eur(m.netSoc)}</Badge>
            <Badge variant={cashOk ? "success" : "destructive"} className="hidden md:inline-flex">Tréso {cashOk ? "OK" : "risque"}</Badge>
            <span className="hidden sm:block w-px h-5 bg-border mx-1" aria-hidden="true" />
            <ShareBar shareLink={sim.shareLink} />
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-5 py-6 grid gap-6 lg:grid-cols-[180px_1fr_330px]">
        {/* Rail de navigation (desktop) */}
        <nav aria-label="Sections du tableau de bord" className="hidden lg:block">
          <div className="sticky top-20 space-y-1">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  aria-current={active === sec.id ? "true" : undefined}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active === sec.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Navigation mobile (chips) */}
        <nav aria-label="Sections" className="lg:hidden -mx-5 px-5 overflow-x-auto flex gap-2 pb-1">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors",
                active === sec.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground",
              )}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        {/* Hypothèses (mobile : au-dessus des résultats) */}
        <div className="lg:hidden">
          <AssumptionsPanel s={sim.s} update={sim.update} reset={sim.reset} setPreset={sim.setPreset} presetIntact={presetIntact} />
        </div>

        {/* Résultats (centre) */}
        <main className="min-w-0">
          <ResultsView sim={sim} />
          <section id="comparaison" className="scroll-mt-28 mt-10">
            <div className="mb-3">
              <h3 className="font-serif text-lg font-semibold">Comparaison de scénarios</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Côte à côte, à hypothèses figées : choisissez la structure et la voie de démarrage.</p>
            </div>
            <Comparison s={sim.s} />
          </section>
          <section id="business" className="scroll-mt-28 mt-10">
            <BusinessModel />
          </section>
        </main>

        {/* Hypothèses (desktop : panneau de droite sticky) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <AssumptionsPanel s={sim.s} update={sim.update} reset={sim.reset} setPreset={sim.setPreset} presetIntact={presetIntact} />
          </div>
        </aside>
      </div>
    </div>
  );
}
