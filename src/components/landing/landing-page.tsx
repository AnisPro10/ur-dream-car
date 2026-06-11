import { Link } from "@tanstack/react-router";
import {
  ArrowRight, ShieldCheck, FileCheck2, Gauge, HeartHandshake,
  Car, MapPin, Check, Search, Wallet, Sparkles,
} from "lucide-react";

const VALUES = [
  { icon: ShieldCheck, title: "La confiance d'abord", text: "On vend la tranquillité, pas le discount. Transparence totale sur l'état réel et l'historique du véhicule." },
  { icon: FileCheck2, title: "Des papiers en règle", text: "Carte grise, contrôle technique récent, historique HistoVec / Car Vertical. Aucune zone d'ombre." },
  { icon: Gauge, title: "Le contrôle expliqué", text: "Chaque point mécanique vérifié et expliqué simplement, pour acheter en comprenant ce que l'on paie." },
  { icon: HeartHandshake, title: "Un accompagnement", text: "Pensé pour les primo-acheteurs et celles et ceux qui veulent être rassurés, avant et après l'achat." },
];

const STEPS = [
  { n: "01", icon: Search, title: "On cible le bon véhicule", text: "Entrée de gamme hors-ZFE ou Crit'Air 2 pour Paris : le bon véhicule pour votre usage et votre zone." },
  { n: "02", icon: ShieldCheck, title: "On vérifie et on garantit", text: "Contrôle réel, papiers en règle, garantie légale. Vous savez exactement ce que vous achetez." },
  { n: "03", icon: HeartHandshake, title: "On vous accompagne", text: "De l'essai à la mise en route, et après la vente. Un interlocuteur, pas un guichet anonyme." },
];

const TRUST = ["Garantie légale", "Papiers en règle", "Contrôle expliqué", "Île-de-France"];

// Silhouette de berline en trait fin — motif décoratif cohérent avec le thème.
function CarLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 200" fill="none" className={className} aria-hidden="true">
      <path
        d="M40 150 L100 150 C112 150 120 142 132 124 C150 98 176 86 220 84 L360 80 C404 78 440 92 470 118 C486 132 500 138 520 140 L580 146 C596 148 604 156 604 168 L604 150"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
      />
      <path d="M150 150 L520 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="udc-dash" opacity="0.35" />
      <circle cx="205" cy="150" r="26" stroke="currentColor" strokeWidth="3" opacity="0.7" />
      <circle cx="205" cy="150" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
      <circle cx="470" cy="150" r="26" stroke="currentColor" strokeWidth="3" opacity="0.7" />
      <circle cx="470" cy="150" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
      <path d="M210 96 L330 92 C360 91 384 98 404 112 L250 114 C236 105 224 99 210 96 Z" fill="currentColor" opacity="0.07" />
    </svg>
  );
}

function CtaPrimary({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className="udc-grain relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
      {/* Lueurs d'ambiance (phares au crépuscule) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="udc-drift absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-[30rem] w-[30rem] rounded-full bg-accent/15 blur-[130px]" />
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)" }}
        />
      </div>

      {/* Barre supérieure */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Car className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-base font-semibold">Négoce VO</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Île-de-France</div>
          </div>
        </div>
        <Link
          to="/synthese"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Gauge className="h-3.5 w-3.5 text-primary" />
          Le simulateur
        </Link>
      </header>

      {/* Héros */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="udc-reveal inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-foreground/80" style={{ animationDelay: "0ms" }}>
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Occasion vérifiée · Confiance & garantie
            </span>

            <h1 className="udc-reveal mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
              La voiture d'occasion,<br />
              <span className="relative whitespace-nowrap text-primary">
                sans la peur
                <svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full" fill="none" aria-hidden="true">
                  <path d="M3 9 C 80 2, 220 2, 297 9" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{" "}
              de se tromper.
            </h1>

            <p className="udc-reveal mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: "160ms" }}>
              Un négoce de véhicules d'occasion en bon état, porté par trois associés. Notre avantage n'est pas le prix —
              c'est la confiance : des papiers en règle, un contrôle expliqué et un accompagnement, à un prix juste.
            </p>

            <div className="udc-reveal mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
              <CtaPrimary to="/demarrage">Accéder au simulateur</CtaPrimary>
              <Link
                to="/business"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Découvrir le projet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="udc-reveal mt-8 flex flex-wrap gap-x-5 gap-y-2" style={{ animationDelay: "320ms" }}>
              {TRUST.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-success" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Carte visuelle */}
          <div className="udc-reveal-soft relative" style={{ animationDelay: "200ms" }}>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-8 shadow-xl backdrop-blur">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "repeating-linear-gradient(115deg, var(--color-primary) 0 1px, transparent 1px 22px)" }} />
              <div className="relative flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Île-de-France</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                  <MapPin className="h-3 w-3" /> Local + livraison
                </span>
              </div>
              <CarLine className="udc-float relative mt-6 w-full text-primary" />
              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Segments</div>
                  <div className="mt-1 font-serif text-sm font-semibold">Entrée de gamme · Crit'Air 2</div>
                </div>
                <div className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cible</div>
                  <div className="mt-1 font-serif text-sm font-semibold">Primo-acheteurs rassurés</div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute -right-3 -top-3 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="relative z-10 border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Pourquoi nous</span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Acheter une occasion, l'esprit tranquille.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Une clientèle mal conseillée n'ose pas s'aventurer seule. On répond exactement à ce besoin : être rassuré, accompagné, et savoir ce que l'on paie.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teaser simulateur */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary p-8 text-primary-foreground sm:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 40px)" }} />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                  <Gauge className="h-3.5 w-3.5" /> Le simulateur
                </span>
                <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Le modèle financier, chiffré honnêtement.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
                  Marge réelle par véhicule, trésorerie mois par mois, fiscalité SAS / SASU / SARL, mode stock ou courtage,
                  comparaison de scénarios. Tout est paramétrable, en temps réel.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Compte de résultat", "Trésorerie", "Fiscalité 2026", "Stock vs courtage"].map((t) => (
                    <span key={t} className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">{t}</span>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    to="/demarrage"
                    className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Ouvrir le simulateur
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:w-72">
                {[
                  { icon: Wallet, k: "Marge / véhicule (2ᵉ segment)", v: "+498 €" },
                  { icon: Gauge, k: "Seuil rentabilité", v: "≈ 18/an" },
                  { icon: ShieldCheck, k: "Flat tax 2026", v: "31,4 %" },
                  { icon: Car, k: "Voie de départ", v: "Courtage" },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.k} className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
                      <Icon className="h-4 w-4 text-primary-foreground/70" />
                      <div className="mt-3 font-mono text-lg font-semibold tabular-nums">{kpi.v}</div>
                      <div className="mt-0.5 text-[11px] text-primary-foreground/70">{kpi.k}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="relative z-10 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Comment ça marche</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Trois étapes, zéro mauvaise surprise.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.n} className="relative rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-semibold text-primary/25">{st.n}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{st.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{st.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final / pied de page */}
      <section className="relative z-10 border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Prêt à explorer le projet et ses chiffres ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Le simulateur ouvre directement sur la synthèse : résultat, trésorerie, fiscalité et scénarios, tout est paramétrable.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CtaPrimary to="/demarrage">Accéder au simulateur</CtaPrimary>
            <Link
              to="/hypotheses"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Saisir mes hypothèses
            </Link>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
                <Car className="h-4 w-4" />
              </span>
              <span className="font-serif font-semibold text-foreground">Négoce VO</span>
              <span>· Île-de-France</span>
            </div>
            <span>Projet porté par trois associés · Simulation indicative</span>
          </div>
        </div>
      </section>
    </div>
  );
}
