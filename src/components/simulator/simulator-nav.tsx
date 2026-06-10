import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  SlidersHorizontal, LayoutDashboard, FileText, LineChart, BarChart3,
  Columns3, Briefcase, Link2, Check, Printer, Rocket, BookOpenText, CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { eur } from "./use-simulator";
import { useSim } from "./simulator-context";
import { HealthIndicator } from "./health-indicator";

// Hypothèses en tête : on saisit puis on consulte chaque rubrique.
export const NAV_ITEMS = [
  { to: "/demarrage", label: "Démarrage", icon: Rocket },
  { to: "/hypotheses", label: "Hypothèses", icon: SlidersHorizontal },
  { to: "/synthese", label: "Synthèse", icon: LayoutDashboard, exact: true as const },
  { to: "/compte-resultat", label: "Compte de résultat", icon: FileText },
  { to: "/tresorerie", label: "Trésorerie", icon: LineChart },
  { to: "/scenarios", label: "Scénarios", icon: BarChart3 },
  { to: "/projection", label: "Projection 3 ans", icon: CalendarRange },
  { to: "/comparaison", label: "Comparaison", icon: Columns3 },
  { to: "/business", label: "Business & juridique", icon: Briefcase },
  { to: "/dictionnaire", label: "Dictionnaire", icon: BookOpenText },
] as const;

function ShareBar() {
  const { shareLink } = useSim();
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

export function SimulatorHeader() {
  const { s, m, cashOk, presetIntact } = useSim();
  const modeLabel = presetIntact ? (s.mode === "realiste" ? "Réaliste" : "Prudent") : "Personnalisé";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-[1500px] mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Retour à l'accueil">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold hidden sm:inline">Simulateur</span>
          <h1 className="font-serif text-base font-semibold truncate">Négoce de véhicules d'occasion</h1>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="hidden sm:inline-flex">Statut : {s.statut}</Badge>
          <Badge variant="secondary" className="hidden sm:inline-flex">Mode : {modeLabel}</Badge>
          <Badge variant={m.netSoc > 0 ? "success" : "destructive"}>{eur(m.netSoc)}</Badge>
          <Badge variant={cashOk ? "success" : "destructive"} className="hidden md:inline-flex">
            Tréso {cashOk ? "OK" : "risque"}
          </Badge>
          <HealthIndicator />
          <span className="hidden sm:block w-px h-5 bg-border mx-1" aria-hidden="true" />
          <ShareBar />
        </div>
      </div>
    </header>
  );
}

// Rail latéral (desktop) : navigation entre les pages du simulateur.
export function SimulatorSideNav() {
  return (
    <nav aria-label="Sections du simulateur" className="hidden lg:block">
      <div className="sticky top-20 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item && item.exact === true }}
              className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-primary/10 text-primary font-semibold hover:bg-primary/10" }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Chips (mobile) : même navigation, version horizontale.
export function SimulatorTopNav() {
  return (
    <nav aria-label="Sections" className="lg:hidden -mx-5 px-5 overflow-x-auto flex gap-2 pb-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: "exact" in item && item.exact === true }}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors border-border text-muted-foreground",
          )}
          activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
