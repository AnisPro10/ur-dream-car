import type { Hypotheses } from "./use-simulator";

// Scénarios nommés sauvegardés localement (plusieurs simulations côte à côte).
export type ScenarioSauve = { nom: string; etat: Hypotheses; date: number };
const KEY = "udc-sim-scenarios";

export function listScenarios(): ScenarioSauve[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function persist(list: ScenarioSauve[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

// Enregistre (ou écrase si même nom) et renvoie la liste à jour.
export function saveScenario(nom: string, etat: Hypotheses): ScenarioSauve[] {
  const clean = nom.trim().slice(0, 60);
  if (!clean) return listScenarios();
  const list = listScenarios().filter((s) => s.nom !== clean);
  list.unshift({ nom: clean, etat, date: Date.now() });
  persist(list);
  return list;
}

export function deleteScenario(nom: string): ScenarioSauve[] {
  const list = listScenarios().filter((s) => s.nom !== nom);
  persist(list);
  return list;
}
