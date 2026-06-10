import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dictionnaire")({
  head: () => ({
    meta: [
      { title: "Dictionnaire — Simulateur négoce VO" },
      { name: "description", content: "Tous les termes techniques du simulateur (finance, fiscalité, juridique, aides) expliqués simplement." },
      { property: "og:title", content: "Dictionnaire — Simulateur négoce VO" },
      { property: "og:description", content: "Glossaire simple : marge, TVA, BFR, IS, flat tax, TNS, ARCE…" },
    ],
  }),
  component: DictionnairePage,
});

type Terme = { mot: string; cat: "Finance" | "Fiscalité" | "Juridique" | "Aides & social" | "Métier auto"; def: string; exemple?: string };

// Même esprit que l'onglet Dictionnaire des fichiers Excel : chaque terme expliqué
// comme à quelqu'un de non financier, avec un exemple chiffré quand c'est utile.
const TERMES: Terme[] = [
  // Finance
  { mot: "Chiffre d'affaires (CA)", cat: "Finance", def: "Tout l'argent encaissé par les ventes, avant de retirer la moindre dépense.", exemple: "24 voitures vendues ~6 350 € en moyenne → CA ≈ 152 400 €." },
  { mot: "Marge brute", cat: "Finance", def: "Prix de revente moins prix d'achat du véhicule. C'est ce qui reste avant les frais.", exemple: "Achetée 8 000 €, revendue 9 500 € → marge brute 1 500 €." },
  { mot: "Frais variables", cat: "Finance", def: "Dépenses liées à chaque voiture : préparation, transport, garantie, contrôle technique, annonces. Plus on vend, plus ils montent.", exemple: "≈ 935 € par voiture dans le scénario prudent." },
  { mot: "Contribution (par voiture)", cat: "Finance", def: "Ce qu'une voiture rapporte vraiment : marge brute − TVA sur marge − frais variables. Si c'est négatif, chaque vente fait perdre de l'argent.", exemple: "Entrée de gamme ≈ −102 € (perte) ; Crit'Air 2 ≈ +315 €." },
  { mot: "Charges fixes", cat: "Finance", def: "Dépenses qui tombent tous les mois même sans vendre : local, assurances, abonnements.", exemple: "500 €/mois = 6 000 €/an à couvrir avant de gagner 1 €." },
  { mot: "Seuil de rentabilité", cat: "Finance", def: "Nombre de ventes nécessaire pour couvrir les charges fixes. En dessous, on perd ; au-dessus, on gagne.", exemple: "≈ 257 voitures/an dans le modèle initial — signe que la marge unitaire était trop faible." },
  { mot: "Résultat net", cat: "Finance", def: "Le vrai bénéfice (ou la vraie perte) de l'année, une fois TOUT payé : achats, frais, salaires, impôts.", exemple: "Scénario prudent : −5 440 € ; réaliste : −16 410 €." },
  { mot: "Trésorerie", cat: "Finance", def: "L'argent réellement disponible sur le compte à un instant donné. On peut être « rentable » sur le papier et à sec en caisse.", },
  { mot: "Point bas de trésorerie", cat: "Finance", def: "Le moment de l'année où le compte est au plus bas. S'il est négatif, il manque de l'argent pour tenir.", },
  { mot: "BFR (besoin en fonds de roulement)", cat: "Finance", def: "L'argent immobilisé dans le stock en attendant de revendre. Il faut le financer avec le capital ou des aides.", exemple: "4 voitures en stock à ~5 600 € = ≈ 22 400 € immobilisés." },
  { mot: "Rotation du stock", cat: "Finance", def: "Vitesse à laquelle une voiture achetée est revendue. Plus c'est rapide, moins d'argent dort dans le stock.", exemple: "Rotation 2 mois = chaque voiture reste ~60 jours." },
  { mot: "ROI (retour sur capital)", cat: "Finance", def: "Ce que rapporte chaque euro investi : résultat net ÷ capital de départ.", },
  // Fiscalité
  { mot: "TVA sur marge", cat: "Fiscalité", def: "Régime des négociants qui achètent à des particuliers : la TVA (20 %) ne porte que sur la marge, pas sur le prix total. Contrepartie : la TVA des réparations n'est pas récupérable.", exemple: "Marge 1 500 € → TVA = 1 500 × 20/120 = 250 €." },
  { mot: "IS (impôt sur les sociétés)", cat: "Fiscalité", def: "Impôt sur le bénéfice de la société : 15 % jusqu'à 42 500 €, 25 % au-delà. Zéro si la société perd de l'argent.", exemple: "Bénéfice 30 000 € → IS = 4 500 €." },
  { mot: "Flat tax / PFU", cat: "Fiscalité", def: "Impôt unique sur les dividendes : 31,4 % en 2026 (12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux). Prélevé avant que l'associé touche son argent.", exemple: "10 000 € de dividendes → 6 860 € nets en poche." },
  { mot: "Dividendes", cat: "Fiscalité", def: "Part du bénéfice (après IS) versée aux associés, proportionnellement à leurs parts. Imposés à la flat tax.", },
  { mot: "Dividendes SARL > 10 % du capital", cat: "Fiscalité", def: "Spécialité SARL : la part des dividendes du gérant majoritaire qui dépasse 10 % du capital paie ~45 % de cotisations TNS + 12,8 % d'impôt (≈ 57,8 %), au lieu de la flat tax. C'est ce qui rend les dividendes SARL peu intéressants.", exemple: "Capital 18 000 € → seuil 1 800 € : au-delà, ≈ 57,8 % de prélèvements." },
  { mot: "CFE", cat: "Fiscalité", def: "Cotisation foncière des entreprises : petite taxe locale annuelle. Gratuite l'année de création, due ensuite.", exemple: "≈ 300 €/an à partir de l'année 2." },
  // Juridique
  { mot: "SAS", cat: "Juridique", def: "Société par actions simplifiée : plusieurs associés, très flexible. Le président est « assimilé salarié » (protection sociale du salarié, charges ~80 % du net). Dividendes à la flat tax sans cotisations.", },
  { mot: "SASU", cat: "Juridique", def: "SAS à un seul associé (unipersonnelle). Mêmes règles que la SAS, mais l'associé unique garde tous les dividendes. Devient une SAS si d'autres associés entrent.", },
  { mot: "SARL", cat: "Juridique", def: "Société à responsabilité limitée. Le gérant majoritaire est TNS : salaire moins chargé (~45 %), mais dividendes pénalisés au-delà de 10 % du capital et ~1 300 €/an de cotisations même sans salaire.", },
  { mot: "Assimilé salarié", cat: "Juridique", def: "Statut du président de SAS/SASU : protection sociale proche du salarié (retraite, santé), mais charges élevées (~80 % du net). S'il ne se paie pas : zéro charge.", exemple: "18 000 € nets de salaire coûtent ≈ 32 400 € à la société." },
  { mot: "TNS (travailleur non salarié)", cat: "Juridique", def: "Statut du gérant majoritaire de SARL : cotisations plus faibles (~45 % du net) mais protection moindre et cotisations minimales (~1 300 €/an) même sans se payer.", },
  { mot: "Capital social", cat: "Juridique", def: "L'argent apporté par les associés à la création. Il finance le démarrage et sert de référence au seuil des 10 % pour les dividendes SARL.", exemple: "Projet : 18 000 € (apports + ARCE)." },
  { mot: "Gérant / Président", cat: "Juridique", def: "Le dirigeant légal de la société : « gérant » en SARL, « président » en SAS/SASU. C'est lui qu'on paramètre dans Démarrage.", },
  { mot: "Garantie légale de conformité", cat: "Juridique", def: "Obligation du vendeur professionnel : 2 ans de garantie sur le véhicule vendu. Pendant 12 mois (occasion), le défaut est présumé exister depuis la vente — c'est au vendeur de prouver le contraire.", exemple: "Provision prudente : 400 à 700 € par voiture." },
  // Aides & social
  { mot: "ARE", cat: "Aides & social", def: "Allocation chômage mensuelle. Un président de SAS NON rémunéré la conserve intégralement — d'où la stratégie « dirigeant non payé » au départ.", },
  { mot: "ARCE", cat: "Aides & social", def: "Au lieu de toucher le chômage chaque mois, on reçoit 60 % de ses droits restants en capital, en deux versements, pour financer la société.", exemple: "Hypothèse projet : ≈ 6 000 € injectés au capital." },
  { mot: "ACRE", cat: "Aides & social", def: "Exonération de ~50 % des cotisations sociales la première année du créateur, sous conditions. À demander dans les 60 jours.", },
  { mot: "Prêt d'honneur", cat: "Aides & social", def: "Prêt à 0 % accordé au créateur (Initiative France, Réseau Entreprendre…) : jusqu'à ~25 000 € en Île-de-France. Renforce la trésorerie sans intérêts ni garantie.", },
  { mot: "Charges sociales", cat: "Aides & social", def: "Cotisations (retraite, santé…) payées sur les salaires. SAS/SASU : ~80 % du net. SARL TNS : ~45 % du net.", },
  // Métier auto
  { mot: "Crit'Air 2", cat: "Métier auto", def: "Vignette des diesels récents et essence 2006-2010. Encore autorisée dans la ZFE du Grand Paris — segment le plus rentable du projet (+315 €/voiture).", },
  { mot: "ZFE", cat: "Métier auto", def: "Zone à faibles émissions : les vieilles vignettes Crit'Air n'ont plus le droit d'y rouler. Impose d'adapter le véhicule vendu à la zone du client.", },
  { mot: "Courtage / mandat", cat: "Métier auto", def: "Vendre sans acheter : on trouve la voiture pour le client et on facture une commission. Pas de stock, pas de BFR, pas de garantie portée — la voie de démarrage recommandée.", exemple: "600 € de commission par mandat ; rentable dès la 1re année (+1 326 €)." },
  { mot: "Négoce VO", cat: "Métier auto", def: "Achat-revente de véhicules d'occasion en professionnel : statut déclaré, garantie légale, TVA sur marge.", },
  { mot: "HistoVec / Car Vertical", cat: "Métier auto", def: "Historiques officiels d'un véhicule (accidents, kilométrage, entretien). Les montrer au client = l'argument confiance du projet.", },
];

const CATS = ["Tous", "Finance", "Fiscalité", "Juridique", "Aides & social", "Métier auto"] as const;

function DictionnairePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("Tous");

  const visibles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TERMES.filter((t) =>
      (cat === "Tous" || t.cat === cat) &&
      (!needle || t.mot.toLowerCase().includes(needle) || t.def.toLowerCase().includes(needle)),
    );
  }, [q, cat]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-xl font-semibold">Dictionnaire</h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Tous les termes techniques du simulateur, expliqués comme à quelqu'un de non financier — le même esprit que l'onglet Dictionnaire des fichiers Excel.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un terme (ex. BFR, flat tax…)"
            aria-label="Chercher un terme du dictionnaire"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div role="radiogroup" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c} type="button" role="radio" aria-checked={cat === c} onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucun terme ne correspond à « {q} ».</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibles.map((t) => (
            <Card key={t.mot}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-semibold leading-snug">{t.mot}</h3>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{t.cat}</Badge>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.def}</p>
                {t.exemple && (
                  <p className="mt-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs leading-relaxed text-foreground/80">
                    <span className="font-semibold text-primary">Exemple : </span>{t.exemple}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
