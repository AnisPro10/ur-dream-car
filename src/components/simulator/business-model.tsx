import { Card, CardContent } from "@/components/ui/card";
import { RemunerationSim } from "./remuneration-sim";

function Point({ k, v }: { k: string; v: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-xs font-semibold text-primary mb-0.5">{k}</div>
      <p className="text-sm text-foreground leading-relaxed">{v}</p>
    </div>
  );
}

function PhaseCard({
  tag, title, accentClass, points,
}: { tag: string; title: string; accentClass: string; points: { k: string; v: string }[] }) {
  return (
    <Card className={`border-l-4 ${accentClass}`}>
      <CardContent className="p-5">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">{tag}</div>
        <h3 className="font-serif text-lg font-semibold mt-1 mb-3">{title}</h3>
        {points.map((p, i) => <Point key={i} {...p} />)}
      </CardContent>
    </Card>
  );
}

const compare: [string, string, string][] = [
  ["Régime social du dirigeant", "Assimilé salarié", "Gérant majoritaire (TNS)"],
  ["Cotisations si non rémunéré", "Aucune", "≈ 1 300 €/an"],
  ["Charges sur un salaire", "≈ 80 % du net", "≈ 45 % du net"],
  ["Dividendes", "Flat tax 31,4 %", "+ ≈ 45 % au-delà de 10 % du capital"],
  ["Cession de parts / actions", "Libre (0,1 %)", "Agrément (3 %)"],
  ["Maintien de l'ARE (non rémunéré)", "Simple et propre", "Parasité par le TNS"],
  ["Flexibilité / entrée d'associés", "Élevée", "Plus encadrée"],
];

export function BusinessModel() {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">Le projet en une phrase</div>
          <p className="text-sm leading-relaxed mt-1.5">
            Un négoce de véhicules d'occasion en bon état, porté par trois associés au profil financier.
            L'avantage concurrentiel n'est pas le prix — impossible de battre durablement un particulier sans charges —
            mais la confiance, le contrôle, des papiers en règle et l'accompagnement, à un prix juste.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <PhaseCard
          tag="Phase 1"
          title="Cadrage"
          accentClass="border-l-[var(--color-chart-1)]"
          points={[
            { k: "Opportunité", v: "La bascule vers l'électrique rend le thermique d'occasion accessible. Une clientèle mal conseillée (femmes, primo-acheteurs) n'ose pas s'aventurer seule. Import Allemagne entre particuliers en complément." },
            { k: "Positionnement", v: "Voitures en bon état, sans réparation-revente. Différenciation par la confiance et le service, pas le discount." },
            { k: "Risques identifiés", v: "Statut pro obligatoire ; garantie légale non-exonérable ; TVA sur marge (réparations non déductibles) ; collision avec les ZFE." },
            { k: "Décision", v: "La confiance et le service au cœur ; le prix juste en appui." },
          ]}
        />
        <PhaseCard
          tag="Phase 2"
          title="Marché & sourcing"
          accentClass="border-l-[var(--color-chart-2)]"
          points={[
            { k: "Stratégie ZFE", v: "Mixte : entrée de gamme hors-zone, Crit'Air 2 pour Paris. Local en IDF. Toujours adapter le Crit'Air du véhicule à la zone du client." },
            { k: "Cible de départ", v: "Primo-acheteurs et femmes en quête de réassurance — même besoin d'être rassurés et accompagnés." },
            { k: "Sourcing", v: "Particuliers (Le Bon Coin) et bouche-à-oreille — préserve la TVA sur marge. Enchères pro plus tard." },
            { k: "Réponse aux failles", v: "Entreprise visible, contrôle mécanique réel, historique HistoVec / Car Vertical, CT récent, accompagnement." },
            { k: "Canaux", v: "Le Bon Coin pro, lives TikTok, bouche-à-oreille." },
          ]}
        />
        <PhaseCard
          tag="Phase 3"
          title="Modèle financier"
          accentClass="border-l-[var(--color-chart-3)]"
          points={[
            { k: "Marge réelle / voiture", v: "Avec les prix de l'étude initiale (achat 4 000 → revente 5 000), l'entrée de gamme perdait ~102 €/voiture. Le paramétrage actuel des associés (sourcing 2 500 → 3 200, garantie 100 €) la rend positive ≈ +248 € ; le 2ᵉ segment ≈ +498 €." },
            { k: "Structure", v: "Charges fixes ~400 €/mois (dont assurance 250 € — valeur marché). Seuil de rentabilité ≈ 18 voitures/an avec le paramétrage actuel (il était de 257 avec les hypothèses de l'étude initiale)." },
            { k: "Année 1", v: "Paramétrage actuel : CA ≈ 78 720 € ; résultat net ≈ +1 496 € ; BFR ≈ 11 140 € couvert par 20 000 € de capital. Scénario réaliste (toutes charges) : ≈ −24 810 €." },
            { k: "Verdict", v: "Le modèle ne tient que si le sourcing à bas prix (2 500 €) et la provision garantie réduite (100 €) se confirment sur le terrain. Sinon, retour au plan prudent : démarrer en courtage (≈ +2 346 € sans stock ni BFR)." },
          ]}
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-serif text-lg font-semibold mb-3">Notre approche & stratégie</h3>
          <div className="grid md:grid-cols-2 gap-x-6">
            <Point k="Approche" v="Vendre la confiance : transparence totale, contrôle expliqué, accompagnement avant et après l'achat." />
            <Point k="Cible" v="Primo-acheteurs et femmes en quête de réassurance au démarrage, élargissement ensuite." />
            <Point k="Stratégie de départ" v="Démarrer en courtage (sans stock, sans BFR, sans garantie portée) pour prouver la demande ; sourcing particuliers + bouche-à-oreille ; dirigeant non rémunéré (ARE) ; financement prêt d'honneur 0 % + ARCE." />
            <Point k="Stratégie d'évolution" v="Basculer vers le stock une fois la réputation et le capital en place ; monter en Crit'Air 2 (seul segment rentable) ; renforcer le sourcing pour baisser le coût garantie ; enchères pro." />
            <Point k="Zone géographique" v="Île-de-France au démarrage (local), puis livraison nationale, dans le respect des ZFE." />
            <Point k="Type de véhicules" v="Entrée de gamme (3 000–5 000 €, hors-ZFE) et Crit'Air 2 (clientèle parisienne)." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-serif text-lg font-semibold mb-1">Statut juridique — SAS vs SARL</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Le statut ne change ni la marge ni les charges fixes : il agit sur les cotisations, le coût d'un salaire et la fiscalité des dividendes.
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1fr_1.2fr] bg-primary text-primary-foreground text-xs font-semibold">
              <div className="px-3 py-2">Critère</div>
              <div className="px-3 py-2">SAS</div>
              <div className="px-3 py-2">SARL</div>
            </div>
            {compare.map((r, i) => (
              <div key={i} className={`grid grid-cols-[1.6fr_1fr_1.2fr] border-t border-border text-xs ${i % 2 ? "bg-muted/40" : "bg-card"}`}>
                <div className="px-3 py-2">{r[0]}</div>
                <div className="px-3 py-2 font-semibold text-[var(--color-chart-1)]">{r[1]}</div>
                <div className="px-3 py-2 font-semibold text-[var(--color-chart-2)]">{r[2]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="font-semibold text-primary">Décision retenue : SAS. </span>
            <span className="leading-relaxed">
              L'associé au chômage devient président non rémunéré au démarrage : zéro charge sociale, ARE maintenue,
              dividendes efficaces et flexibilité pour grandir. La SARL n'aurait été plus avantageuse que sur le coût d'un salaire.
            </span>
          </div>
        </CardContent>
      </Card>

      <RemunerationSim />
    </div>
  );
}
