// Glossaire partagé : alimente l'onglet /dictionnaire ET les infobulles du simulateur.
// Même esprit que l'onglet Dictionnaire des fichiers Excel.
export type Categorie = "Finance" | "Fiscalité" | "Juridique" | "Aides & social" | "Métier auto";
export type Terme = { mot: string; cat: Categorie; def: string; exemple?: string };

export const TERMES: Terme[] = [
  // Finance
  { mot: "Chiffre d'affaires (CA)", cat: "Finance", def: "Tout l'argent encaissé par les ventes, avant de retirer la moindre dépense.", exemple: "24 voitures vendues ~6 350 € en moyenne → CA ≈ 152 400 €." },
  { mot: "Marge brute", cat: "Finance", def: "Prix de revente moins prix d'achat du véhicule. C'est ce qui reste avant les frais.", exemple: "Achetée 8 000 €, revendue 9 500 € → marge brute 1 500 €." },
  { mot: "Frais variables", cat: "Finance", def: "Dépenses liées à chaque voiture : préparation, transport, garantie, contrôle technique, annonces. Plus on vend, plus ils montent.", exemple: "≈ 935 € par voiture dans le scénario prudent." },
  { mot: "Contribution", cat: "Finance", def: "Ce qu'une voiture rapporte vraiment : marge brute − TVA sur marge − frais variables. Si c'est négatif, chaque vente fait perdre de l'argent.", exemple: "Entrée de gamme ≈ −102 € (perte) ; Crit'Air 2 ≈ +315 €." },
  { mot: "Charges fixes", cat: "Finance", def: "Dépenses qui tombent tous les mois même sans vendre : local, assurances, abonnements.", exemple: "500 €/mois = 6 000 €/an à couvrir avant de gagner 1 €." },
  { mot: "Seuil de rentabilité", cat: "Finance", def: "Nombre de ventes nécessaire pour couvrir les charges fixes. En dessous on perd, au-dessus on gagne.", exemple: "≈ 257 voitures/an dans le modèle initial — la marge unitaire était trop faible." },
  { mot: "Résultat net", cat: "Finance", def: "Le vrai bénéfice (ou la vraie perte) de l'année, une fois TOUT payé : achats, frais, salaires, impôts.", exemple: "Scénario prudent : −5 440 € ; réaliste : −16 410 €." },
  { mot: "Marge nette", cat: "Finance", def: "Le résultat net rapporté au chiffre d'affaires, en %. Mesure ce qui reste vraiment sur 100 € vendus.", },
  { mot: "Trésorerie", cat: "Finance", def: "L'argent réellement disponible sur le compte à un instant donné. On peut être rentable sur le papier et à sec en caisse.", },
  { mot: "Point bas de trésorerie", cat: "Finance", def: "Le moment de l'année où le compte est au plus bas. S'il est négatif, il manque de l'argent pour tenir.", },
  { mot: "BFR", cat: "Finance", def: "Besoin en fonds de roulement : l'argent immobilisé dans le stock en attendant de revendre. Il faut le financer avec le capital ou des aides.", exemple: "4 voitures en stock à ~5 600 € = ≈ 22 400 € immobilisés." },
  { mot: "Rotation du stock", cat: "Finance", def: "Vitesse à laquelle une voiture achetée est revendue. Plus c'est rapide, moins d'argent dort dans le stock.", exemple: "Rotation 2 mois = chaque voiture reste ~60 jours." },
  { mot: "ROI", cat: "Finance", def: "Retour sur capital : ce que rapporte chaque euro investi (résultat net ÷ capital de départ).", },
  // Fiscalité
  { mot: "TVA sur marge", cat: "Fiscalité", def: "Régime des négociants qui achètent à des particuliers : la TVA (20 %) ne porte que sur la marge, pas sur le prix total. Contrepartie : la TVA des réparations n'est pas récupérable.", exemple: "Marge 1 500 € → TVA = 1 500 × 20/120 = 250 €." },
  { mot: "IS", cat: "Fiscalité", def: "Impôt sur les sociétés : impôt sur le bénéfice, 15 % jusqu'à 42 500 €, 25 % au-delà. Zéro si la société perd de l'argent.", exemple: "Bénéfice 30 000 € → IS = 4 500 €." },
  { mot: "Flat tax", cat: "Fiscalité", def: "PFU : impôt unique sur les dividendes, 31,4 % en 2026 (12,8 % d'impôt sur le revenu + 18,6 % de prélèvements sociaux).", exemple: "10 000 € de dividendes → 6 860 € nets en poche." },
  { mot: "Dividendes", cat: "Fiscalité", def: "Part du bénéfice (après IS) versée aux associés, proportionnellement à leurs parts. Imposés à la flat tax.", },
  { mot: "Dividendes SARL > 10 % du capital", cat: "Fiscalité", def: "En SARL, la part des dividendes du gérant majoritaire au-delà de 10 % du capital paie ~45 % de cotisations TNS + 12,8 % d'impôt (≈ 57,8 %), au lieu de la flat tax.", exemple: "Capital 18 000 € → seuil 1 800 € : au-delà, ≈ 57,8 % de prélèvements." },
  { mot: "CFE", cat: "Fiscalité", def: "Cotisation foncière des entreprises : petite taxe locale annuelle. Gratuite l'année de création, due ensuite.", exemple: "≈ 300 €/an à partir de l'année 2." },
  // Juridique
  { mot: "SAS", cat: "Juridique", def: "Société par actions simplifiée : plusieurs associés, très flexible. Président « assimilé salarié » (charges ~80 % du net). Dividendes à la flat tax sans cotisations.", },
  { mot: "SASU", cat: "Juridique", def: "SAS à un seul associé (unipersonnelle). Mêmes règles, mais l'associé unique garde tous les dividendes. Devient une SAS si d'autres associés entrent.", },
  { mot: "SARL", cat: "Juridique", def: "Société à responsabilité limitée. Gérant majoritaire TNS : salaire moins chargé (~45 %), mais dividendes pénalisés au-delà de 10 % du capital et ~1 300 €/an de cotisations même sans salaire.", },
  { mot: "Assimilé salarié", cat: "Juridique", def: "Statut du président de SAS/SASU : protection sociale proche du salarié, mais charges élevées (~80 % du net). S'il ne se paie pas : zéro charge.", exemple: "18 000 € nets de salaire coûtent ≈ 32 400 € à la société." },
  { mot: "TNS", cat: "Juridique", def: "Travailleur non salarié (gérant majoritaire de SARL) : cotisations plus faibles (~45 % du net) mais protection moindre et cotisations minimales (~1 300 €/an) même sans se payer.", },
  { mot: "Capital social", cat: "Juridique", def: "L'argent apporté par les associés à la création. Finance le démarrage et sert de référence au seuil des 10 % pour les dividendes SARL.", exemple: "Projet : 18 000 € (apports + ARCE)." },
  { mot: "Garantie légale de conformité", cat: "Juridique", def: "Obligation du vendeur professionnel : 2 ans de garantie. Pendant 12 mois (occasion), le défaut est présumé exister depuis la vente — au vendeur de prouver le contraire.", exemple: "Provision prudente : 400 à 700 € par voiture." },
  // Aides & social
  { mot: "ARE", cat: "Aides & social", def: "Allocation chômage mensuelle. Un président de SAS NON rémunéré la conserve intégralement — d'où la stratégie « dirigeant non payé » au départ.", },
  { mot: "ARCE", cat: "Aides & social", def: "Au lieu du chômage mensuel, on reçoit 60 % de ses droits restants en capital, en deux versements, pour financer la société.", exemple: "Hypothèse projet : ≈ 6 000 € injectés au capital." },
  { mot: "ACRE", cat: "Aides & social", def: "Exonération de ~50 % des cotisations sociales la première année du créateur, sous conditions. À demander dans les 60 jours.", },
  { mot: "Prêt d'honneur", cat: "Aides & social", def: "Prêt à 0 % accordé au créateur (Initiative France, Réseau Entreprendre…) : jusqu'à ~25 000 € en Île-de-France. Renforce la trésorerie sans intérêts.", },
  { mot: "Charges sociales", cat: "Aides & social", def: "Cotisations (retraite, santé…) payées sur les salaires. SAS/SASU : ~80 % du net. SARL TNS : ~45 % du net.", },
  // Métier auto
  { mot: "Crit'Air 2", cat: "Métier auto", def: "Vignette des diesels récents et essence 2006-2010. Encore autorisée dans la ZFE du Grand Paris — segment le plus rentable du projet (+315 €/voiture).", },
  { mot: "ZFE", cat: "Métier auto", def: "Zone à faibles émissions : les vieilles vignettes Crit'Air n'ont plus le droit d'y rouler. Impose d'adapter le véhicule à la zone du client.", },
  { mot: "Courtage", cat: "Métier auto", def: "Vendre sans acheter : on trouve la voiture pour le client et on facture une commission. Pas de stock, pas de BFR, pas de garantie portée — la voie de démarrage recommandée.", exemple: "600 € de commission par mandat ; rentable dès la 1re année (+1 326 €)." },
  { mot: "Négoce VO", cat: "Métier auto", def: "Achat-revente de véhicules d'occasion en professionnel : statut déclaré, garantie légale, TVA sur marge.", },
  { mot: "HistoVec / Car Vertical", cat: "Métier auto", def: "Historiques officiels d'un véhicule (accidents, kilométrage, entretien). Les montrer au client = l'argument confiance du projet.", },
];

export const CATEGORIES: ("Tous" | Categorie)[] = ["Tous", "Finance", "Fiscalité", "Juridique", "Aides & social", "Métier auto"];

const byMot = new Map(TERMES.map((t) => [t.mot.toLowerCase(), t]));
// Récupère une définition par son terme exact (insensible à la casse).
export function getTerme(mot: string): Terme | undefined {
  return byMot.get(mot.toLowerCase());
}
