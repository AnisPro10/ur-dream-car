## Objectif

Remplacer la longue page unique à ancres par une **navigation multi-pages**, avec « Hypothèses » comme point d'entrée et chaque rubrique sur sa propre URL.

## Nouvelle architecture

```text
/hypotheses        → Saisie (panneau actuel, plein écran)
/                  → Synthèse (KPIs + verdict)
/compte-resultat   → Compte de résultat détaillé
/tresorerie        → Courbe de trésorerie 12 mois
/scenarios         → Scénarios de volume
/comparaison       → Comparaison statut × mode, stock vs courtage
/business          → Business & juridique
```

Ordre dans la barre de navigation : **Hypothèses → Synthèse → Compte de résultat → Trésorerie → Scénarios → Comparaison → Business & juridique**.

## Partage d'état

Le hook `useSimulator` persiste déjà l'état dans `localStorage` + hash d'URL. Chaque page appellera `useSimulator()` et lira/écrira la même source de vérité — aucune modification de la logique de calcul.

## Chrome partagée

- Le header (titre + badges Statut/Mode/Résultat/Tréso + HealthIndicator + ShareBar) passe dans `src/routes/__root.tsx` pour rester visible sur toutes les pages.
- La barre de navigation latérale (desktop) / chips (mobile) devient un composant `<SimulatorNav />` rendu dans `__root.tsx`, avec des `<Link to="…">` TanStack Router (au lieu de `scrollToSection`). L'état actif vient de `useRouterState` (pathname).
- `<Outlet />` rend la page courante au centre.
- Le panneau « Hypothèses » de droite est **supprimé de la chrome** — il a sa propre page dédiée. Un encart léger « Récap hypothèses » (statut, mode, volume, mix) reste visible avec un bouton « Modifier » qui pointe vers `/hypotheses`.

## Découpage des composants

- `results.tsx` est éclaté en 4 sous-composants exportés (déjà structurés en sections) :
  - `SyntheseView` (lignes 93-124)
  - `CompteResultatView` (lignes 126-176)
  - `TresorerieView` (lignes 178-198)
  - `ScenariosView` (lignes 200-230)
  Chaque sous-composant reçoit `sim` en prop. Aucun changement de rendu ni de calcul.
- `assumptions-panel.tsx` est réutilisé tel quel sur `/hypotheses`, en pleine largeur (au lieu d'un panneau sticky 330 px).
- `comparison.tsx` et `business-model.tsx` sont inchangés.

## Fichiers à créer

```text
src/routes/hypotheses.tsx
src/routes/compte-resultat.tsx
src/routes/tresorerie.tsx
src/routes/scenarios.tsx
src/routes/comparaison.tsx
src/routes/business.tsx
src/components/simulator/simulator-nav.tsx
src/components/simulator/hypotheses-recap.tsx
```

Chaque route définit son propre `head()` (title + description + og) — Synthèse, Compte de résultat, Trésorerie, etc. — pour SEO et partage.

## Fichiers à modifier

- `src/routes/__root.tsx` : header sticky + layout 2 colonnes (nav | Outlet) + `<Outlet />`.
- `src/routes/index.tsx` : ne contient plus que la Synthèse (KPIs + verdict).
- `src/components/simulator/results.tsx` : split en exports nommés ; suppression de `ResultsView` agrégé.
- `src/components/simulator/use-scrollspy.ts` : devient inutile, supprimé.

## Points hors scope

- Aucune modification de `use-simulator.ts` (logique de calcul, tests, presets, encodage URL).
- Aucun changement visuel des cartes/graphes existants.
- Pas de garde d'authentification (le simulateur reste public).
- Le lien de partage (`#s=…`) continue de fonctionner : `useSimulator` lit le hash au montage sur n'importe quelle route.

## Détails techniques

- Liens : `<Link to="/tresorerie" activeProps={{ className: "bg-primary/10 text-primary font-semibold" }}>` remplace les boutons `scrollToSection`.
- État actif sur mobile : `useRouterState({ select: s => s.location.pathname })`.
- Le `scroll-mt-28` et les `id="…"` sont retirés (plus d'ancres).
- `defaultPreload: "intent"` (déjà actif) → navigation instantanée entre pages.
