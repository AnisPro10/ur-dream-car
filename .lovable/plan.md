… 

## Objectif

Reproduire à l'identique la **logique de calcul** du fichier `Simulateur_Auto_Occasion.jsx` (TVA sur marge, IS progressif, charges sociales SAS/SARL, dividendes, trésorerie mensuelle, BFR, ROI, scénarios de volume) dans le projet TanStack Start, avec une refonte visuelle plus moderne et mieux organisée.

## Ce qui est conservé à l'identique

- Toutes les constantes (`TVA 0.20`, `SAS_SOC 0.80`, `SARL_SOC 0.45`, `COTIS_MIN 1200`, `FLAT 0.30`, `SARL_DIV 0.45`, IS 15 % / 25 % au-delà de 42 500 €).
- Les valeurs par défaut des hypothèses (prix, frais, volume 24, capital 18 000 €, etc.).
- Le bloc `useMemo` complet : calcul de CA, marge brute, TVA sur marge, contribution, charges fixes, excédent, IS, dividendes, trésorerie mois par mois avec décalage de rotation, BFR, ROI, scénarios 12/24/36/48/60.
- Le contenu textuel français du business model (3 phases, comparatif SAS/SARL, décision).

## Ce qui change visuellement

- Refonte avec **shadcn/ui + Tailwind v4** en utilisant les tokens sémantiques (`bg-card`, `text-muted-foreground`, etc.) au lieu de styles inline et palette `C.*` codée en dur.
- Mise en place d'une palette « finance moderne » (teal sobre + accent ambre) dans `src/styles.css` (mode clair + sombre), inspirée de la palette d'origine (#15616D primaire).
- Composants shadcn : `Card`, `Slider`, `Tabs`, `Button`, `Badge`, `Separator`, `Tooltip`, `Alert` pour l'avertissement trésorerie.
- Typo : Fraunces (titres) + Inter (UI) + JetBrains Mono (chiffres), chargés via `<link>` dans `__root.tsx`.
- Réorganisation :
  - En-tête épuré avec titre + sous-titre + bascule onglets.
  - **Sidebar hypothèses** regroupée en sections repliables (Statut, Segments, Frais, Charges, Activité) avec inputs numériques compacts à côté des sliders.
  - **KPIs en bandeau** (4 cartes) avec micro-tendance et code couleur (vert/rouge/neutre via tokens).
  - **Grille résultats** : Compte de résultat | Revenu associés + Ratios/BFR.
  - **Graphiques recharts** retravaillés (grille discrète, tooltips arrondis cohérents avec les Cards).
  - Onglet **Business model** : cartes Phase 1/2/3, tableau comparatif SAS/SARL, encart décision.
- Responsive : sidebar repliée en accordion sur mobile, KPIs en 2×2.

## Structure technique

- Nouvelle route `src/routes/index.tsx` qui devient la page du simulateur.
- Découpage en composants dans `src/components/simulator/` :
  - `use-simulator.ts` — hook avec le state `s` et le `useMemo` (logique copiée verbatim).
  - `assumptions-panel.tsx` — sliders/inputs.
  - `kpi-bar.tsx`, `pl-statement.tsx`, `partners-income.tsx`, `ratios-bfr.tsx`.
  - `cash-chart.tsx`, `volume-chart.tsx` (recharts).
  - `business-model.tsx` — onglet stratégie.
- Installation de `recharts` via `bun add recharts`.
- Mise à jour des metadata SEO de la route (titre « Simulateur — Négoce de véhicules d'occasion », description, og:*).

## Détails techniques (logique de calcul)

Identique au fichier source, ligne pour ligne dans le `useMemo` (lignes 169-226), y compris :
- `tvaMarge = margeBrute * TVA / (1 + TVA)`
- `is = ravis > 0 ? min(ravis, 42500)*0.15 + max(0, ravis-42500)*0.25 : 0`
- `divFisc = divBrut*0.30 + (SARL ? max(0, divBrut - 0.1*capital)*0.45 : 0)`
- Boucle trésorerie 12 mois avec `lag = round(rotation)` et CFE imputée sur M12.
- `revenuDirigeant = remun + divNet/3` (3 associés).

Aucune modification des formules ni des seuils. Le disclaimer fiscal en bas de page est conservé mot pour mot.
