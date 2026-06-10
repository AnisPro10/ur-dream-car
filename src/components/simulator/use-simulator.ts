import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

export const TVA = 0.2;
export const SAS_SOC = 0.8; // SAS/SASU : charges sociales ~80 % du net (assimilé salarié)
export const SARL_SOC = 0.45; // SARL gérant majoritaire (TNS) ~45 % du net
export const COTIS_MIN = 1300; // cotisations minimales SARL si non rémunéré (2026)
export const FLAT = 0.314; // PFU 2026 = 12,8 % IR + 18,6 % prélèvements sociaux (LFSS 2026 : CSG portée à 10,6 %)
export const PFU_IR = 0.128; // part impôt sur le revenu du PFU
export const SARL_DIV = 0.45; // cotisations TNS sur dividendes SARL > 10 % du capital
export const IS_SEUIL = 42500; // seuil IS taux réduit
export const IS_REDUIT = 0.15;
export const IS_PLEIN = 0.25;
export const NB_ASSOCIES = 3;

export const eur = (n: number) =>
  (Math.round(n) === 0 ? "0" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))) + " €";
export const pct = (n: number) => (n * 100).toFixed(1) + " %";
export const num = (n: number, d = 1) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(n);

const isTax = (r: number) => (r > 0 ? Math.min(r, IS_SEUIL) * IS_REDUIT + Math.max(0, r - IS_SEUIL) * IS_PLEIN : 0);

export type Statut = "SAS" | "SASU" | "SARL";
export type Mode = "prudent" | "realiste";
export type Activite = "stock" | "courtage";
export type TresoPoint = { mois: string; treso: number };
export type VolumeScenario = { volume: string; net: number; current: boolean };

// Presets de charges : prudent (modèle audité v3) vs réaliste (toutes charges réelles)
export const PRESETS = {
  prudent: { prep: 50, transport: 50, garantie: 700, petits: 135, decote: 0, local: 300, assur: 50, autres: 150 },
  realiste: { prep: 250, transport: 50, garantie: 450, petits: 135, decote: 125, local: 500, assur: 200, autres: 564 },
} as const;
export const PRESET_KEYS = Object.keys(PRESETS.prudent) as (keyof typeof PRESETS.prudent)[];

export type Hypotheses = {
  achatEg: number; reventeEg: number; achatCa: number; reventeCa: number;
  prep: number; transport: number; garantie: number; petits: number; decote: number;
  local: number; assur: number; autres: number;
  volume: number; mixEg: number; rotation: number; capital: number;
  statut: Statut; remun: number; distrib: number; apresVente: number; cfe: number;
  mode: Mode;
  activite: Activite; commission: number; arce: number; pretHonneur: number;
  // Profil de la société : synchronisé partout (démarrage, hypothèses, juridique, financier)
  nbAssocies: number; dirigeantPrenom: string; dirigeantNom: string;
};

export const defaults: Hypotheses = {
  achatEg: 4000, reventeEg: 5000, achatCa: 8000, reventeCa: 9500,
  ...PRESETS.prudent,
  volume: 24, mixEg: 70, rotation: 2, capital: 18000,
  statut: "SAS", remun: 0, distrib: 0, apresVente: 0, cfe: 0,
  mode: "prudent",
  activite: "stock", commission: 600, arce: 0, pretHonneur: 0,
  nbAssocies: NB_ASSOCIES, dirigeantPrenom: "", dirigeantNom: "",
};

// SASU = unipersonnelle : toujours 1 associé, quel que soit le nombre saisi.
export const nbAssociesEffectif = (s: Pick<Hypotheses, "statut" | "nbAssocies">) =>
  s.statut === "SASU" ? 1 : Math.max(2, Math.round(s.nbAssocies));

export interface ModelResult {
  courtage: boolean; ca: number; achats: number; margeBrute: number; tvaMarge: number; fraisVar: number;
  contribution: number; chargesFixesAn: number; excedent: number; chargesSoc: number;
  cotisMin: number; coutRemun: number; remunInsoutenable: boolean; ravis: number; is: number;
  netSoc: number; divBrut: number; divFisc: number; divNet: number; netConserve: number;
  revenuDirigeant: number; nAssoc: number; tMargeBrute: number; tContribution: number;
  tMargeNette: number; contribParVoiture: number; seuilAn: number; treso: TresoPoint[];
  pointBas: number; stockMoyen: number; bfrFinance: number; rotationStock: number; roi: number;
  ressources: number; financementOk: boolean; volScenarios: VolumeScenario[]; cEg: number; cCa: number;
}

// Fonction de calcul PURE (testable indépendamment de React)
export function computeModel(s: Hypotheses): ModelResult {
  const courtage = s.activite === "courtage";
  const mix = s.mixEg / 100;
  const volEg = s.volume * mix, volCa = s.volume * (1 - mix);
  // En courtage : revenu = commissions, pas d'achat, pas de stock, pas de garantie portée
  const ca = courtage ? s.commission * s.volume : volEg * s.reventeEg + volCa * s.reventeCa;
  const achats = courtage ? 0 : volEg * s.achatEg + volCa * s.achatCa;
  const margeBrute = ca - achats;
  const tvaMarge = margeBrute * TVA / (1 + TVA); // courtage : TVA 20 % sur la commission (service)
  const fvUnit = courtage ? s.transport + s.petits : s.prep + s.transport + s.garantie + s.petits + s.decote;
  const fraisVar = s.volume * fvUnit;
  const contribution = margeBrute - tvaMarge - fraisVar;
  const chargesFixesAn = (s.local + s.assur + s.autres) * 12;
  const excedent = contribution - chargesFixesAn - s.cfe;
  const isSarl = s.statut === "SARL";
  const tauxSoc = isSarl ? SARL_SOC : SAS_SOC;
  const chargesSoc = s.remun * tauxSoc;
  const cotisMin = isSarl ? Math.max(0, COTIS_MIN - chargesSoc) : 0;
  const coutRemun = s.remun + chargesSoc + cotisMin;
  const remunInsoutenable = s.remun > 0 && coutRemun > Math.max(0, excedent);
  const ravis = excedent - s.remun - chargesSoc - cotisMin;
  const is = isTax(ravis);
  const netSoc = ravis - is;
  const divBrut = Math.max(0, netSoc) * (s.distrib / 100);
  const seuilDiv = 0.1 * s.capital;
  const divBelow = Math.min(divBrut, seuilDiv);
  const divAbove = Math.max(0, divBrut - seuilDiv);
  const divFisc = isSarl ? divBelow * FLAT + divAbove * (PFU_IR + SARL_DIV) : divBrut * FLAT;
  const divNet = divBrut - divFisc;
  const netConserve = netSoc - divBrut;
  const nAssoc = nbAssociesEffectif(s);
  const revenuDirigeant = s.remun + divNet / nAssoc;
  const tMargeBrute = ca ? margeBrute / ca : 0;
  const tContribution = ca ? contribution / ca : 0;
  const tMargeNette = ca ? netSoc / ca : 0;
  const contribParVoiture = s.volume ? contribution / s.volume : 0;
  const seuilAn = contribParVoiture ? chargesFixesAn / contribParVoiture : 0;
  const wAchat = mix * s.achatEg + (1 - mix) * s.achatCa;
  const wRevente = mix * s.reventeEg + (1 - mix) * s.reventeCa;
  const mVol = s.volume / 12;
  const achatsM = courtage ? 0 : mVol * wAchat;
  const ventesM = courtage ? ca / 12 : mVol * wRevente;
  const p = s.apresVente / 100;
  const comptantM = achatsM * (1 - p), diffM = achatsM * p;
  const fvM = mVol * fvUnit;
  const tvaM = courtage ? (ca / 12) * TVA / (1 + TVA) : mVol * (wRevente - wAchat) * TVA / (1 + TVA);
  const fixeM = s.local + s.assur + s.autres;
  const remunM = coutRemun / 12;
  const lag = courtage ? 0 : Math.max(0, Math.round(s.rotation));
  const ressources = s.capital + s.arce + s.pretHonneur;
  const treso: TresoPoint[] = []; let prev = ressources;
  for (let i = 0; i < 12; i++) {
    const on = i >= lag;
    const fin = prev + (on ? ventesM : 0) - comptantM - (on ? diffM : 0) - (on ? fvM : 0) - (on ? tvaM : 0) - fixeM - remunM - (i === 11 ? s.cfe : 0);
    treso.push({ mois: "M" + (i + 1), treso: Math.round(fin) }); prev = fin;
  }
  const pointBas = Math.min(...treso.map((x) => x.treso));
  const stockMoyen = courtage ? 0 : achatsM * s.rotation;
  const bfrFinance = stockMoyen * (1 - p);
  const rotationStock = stockMoyen ? achats / stockMoyen : 0;
  const roi = s.capital ? netSoc / s.capital : 0;
  const financementOk = ressources >= bfrFinance;
  const cEg = (s.reventeEg - s.achatEg) - (s.reventeEg - s.achatEg) * TVA / (1 + TVA) - fvUnit;
  const cCa = (s.reventeCa - s.achatCa) - (s.reventeCa - s.achatCa) * TVA / (1 + TVA) - fvUnit;
  const cCom = s.commission - s.commission * TVA / (1 + TVA) - fvUnit; // contribution/affaire en courtage
  const vols = Array.from(new Set([12, 24, 36, 48, 60, s.volume])).sort((a, b) => a - b);
  const volScenarios: VolumeScenario[] = vols.map((v) => {
    const cM = courtage ? v * cCom : v * (mix * cEg + (1 - mix) * cCa);
    const rav = cM - chargesFixesAn - s.cfe - s.remun - chargesSoc - (isSarl ? Math.max(0, COTIS_MIN - s.remun * SARL_SOC) : 0);
    return { volume: v + "/an", net: Math.round(rav - isTax(rav)), current: v === s.volume };
  });
  return {
    courtage, ca, achats, margeBrute, tvaMarge, fraisVar, contribution, chargesFixesAn,
    excedent, chargesSoc, cotisMin, coutRemun, remunInsoutenable, ravis, is, netSoc,
    divBrut, divFisc, divNet, netConserve, revenuDirigeant, nAssoc, tMargeBrute,
    tContribution, tMargeNette, contribParVoiture, seuilAn, treso, pointBas, stockMoyen,
    bfrFinance, rotationStock, roi, ressources, financementOk, volScenarios, cEg, cCa,
  };
}

// Une charge est "personnalisée" si elle diverge du preset du mode courant
export function isPresetIntact(s: Hypotheses): boolean {
  return PRESET_KEYS.every((k) => s[k] === PRESETS[s.mode][k]);
}

// --- Simulation juridique de rémunération (réplique du fichier Excel juridique) ---
// Pour un bénéfice annuel avant rémunération donné, compare comment les associés
// sont payés selon le statut : coût des salaires (1 à N associés rémunérés), IS,
// dividendes nets partagés et revenu net par associé. Règles 2026 = computeModel.
export interface RemunResult {
  statut: Statut; salaire: number; nbRemuneres: number; salaireTotal: number;
  chargesSoc: number; cotisMin: number; coutSalaire: number;
  baseIS: number; is: number; distribuable: number; divBrut: number; divFisc: number; divNet: number;
  nAssoc: number; revenuNetDirigeant: number; revenuAssocieNonRemunere: number;
  prelevements: number; tauxPrelevement: number;
}

export function simulerRemuneration(
  benefice: number, capital: number, statut: Statut, salaire: number,
  opts: { distrib?: number; nbAssocies?: number; nbRemuneres?: number } = {},
): RemunResult {
  const distrib = opts.distrib ?? 100;
  const isSarl = statut === "SARL";
  const nAssoc = statut === "SASU" ? 1 : Math.max(2, Math.round(opts.nbAssocies ?? NB_ASSOCIES));
  // Combien d'associés prennent ce salaire net (0 = tous en dividendes) ; SASU = au plus 1.
  const nbRemuneres = Math.min(
    Math.max(0, Math.round(opts.nbRemuneres ?? (salaire > 0 ? 1 : 0))),
    nAssoc,
  );
  const salaireTotal = salaire * nbRemuneres;
  const chargesSoc = salaireTotal * (isSarl ? SARL_SOC : SAS_SOC);
  // Cotisations minimales : dues par le gérant majoritaire TNS (une personne),
  // même sans rémunération ; couvertes par ses propres cotisations s'il est salarié.
  const cotisMin = isSarl
    ? Math.max(0, COTIS_MIN - (nbRemuneres > 0 ? salaire * SARL_SOC : 0))
    : 0;
  const coutSalaire = salaireTotal + chargesSoc + cotisMin;
  const baseIS = Math.max(benefice - coutSalaire, 0);
  const is = isTax(baseIS);
  const distribuable = baseIS - is;
  const divBrut = Math.max(0, distribuable) * (distrib / 100);
  const seuilDiv = 0.1 * capital;
  const divBelow = Math.min(divBrut, seuilDiv);
  const divAbove = Math.max(0, divBrut - seuilDiv);
  const divFisc = isSarl ? divBelow * FLAT + divAbove * (PFU_IR + SARL_DIV) : divBrut * FLAT;
  const divNet = divBrut - divFisc;
  const revenuNetDirigeant = (nbRemuneres > 0 ? salaire : 0) + divNet / nAssoc;
  const revenuAssocieNonRemunere = divNet / nAssoc;
  const prelevements = chargesSoc + cotisMin + is + divFisc;
  const tauxPrelevement = benefice > 0 ? prelevements / benefice : 0;
  return {
    statut, salaire, nbRemuneres, salaireTotal, chargesSoc, cotisMin, coutSalaire,
    baseIS, is, distribuable, divBrut, divFisc, divNet, nAssoc,
    revenuNetDirigeant, revenuAssocieNonRemunere, prelevements, tauxPrelevement,
  };
}

// --- Sauvegarde / partage : sérialisation de l'état dans l'URL (hash) + localStorage ---
const STORAGE_KEY = "udc-sim-v1";

// Un état chargé depuis l'URL (#s=) ou localStorage peut être périmé, corrompu ou
// forgé. Sans validation, un champ non numérique (ex. volume:"abc") propagerait des
// NaN dans tout le modèle et rendrait l'app inutilisable. zod coerce + borne chaque
// champ ; toute entrée invalide est ignorée et l'on retombe sur les valeurs par défaut.
const numFini = z.coerce.number().finite();
const hypothesesSchema = z.object({
  achatEg: numFini.min(0).max(1_000_000), reventeEg: numFini.min(0).max(1_000_000),
  achatCa: numFini.min(0).max(1_000_000), reventeCa: numFini.min(0).max(1_000_000),
  prep: numFini.min(0).max(100_000), transport: numFini.min(0).max(100_000),
  garantie: numFini.min(0).max(100_000), petits: numFini.min(0).max(100_000),
  decote: numFini.min(0).max(100_000), local: numFini.min(0).max(1_000_000),
  assur: numFini.min(0).max(1_000_000), autres: numFini.min(0).max(1_000_000),
  volume: numFini.min(0).max(100_000), mixEg: numFini.min(0).max(100),
  rotation: numFini.min(0).max(60), capital: numFini.min(0).max(100_000_000),
  statut: z.enum(["SAS", "SASU", "SARL"]), remun: numFini.min(0).max(10_000_000),
  distrib: numFini.min(0).max(100), apresVente: numFini.min(0).max(100),
  cfe: numFini.min(0).max(1_000_000), mode: z.enum(["prudent", "realiste"]),
  activite: z.enum(["stock", "courtage"]), commission: numFini.min(0).max(1_000_000),
  arce: numFini.min(0).max(10_000_000), pretHonneur: numFini.min(0).max(10_000_000),
  nbAssocies: numFini.min(1).max(10),
  dirigeantPrenom: z.string().trim().max(60), dirigeantNom: z.string().trim().max(60),
}).partial();

function safe(parsed: unknown): Partial<Hypotheses> | null {
  const r = hypothesesSchema.safeParse(parsed);
  return r.success ? r.data : null;
}

export function encodeState(s: Hypotheses): string {
  try { return btoa(encodeURIComponent(JSON.stringify(s))); } catch { return ""; }
}
export function decodeState(raw: string): Partial<Hypotheses> | null {
  try { return safe(JSON.parse(decodeURIComponent(atob(raw)))); } catch { return null; }
}
function loadInitial(): Hypotheses {
  if (typeof window === "undefined") return defaults;
  const hash = window.location.hash.replace(/^#s=/, "");
  if (hash) { const d = decodeState(hash); if (d) return { ...defaults, ...d }; }
  try { const ls = localStorage.getItem(STORAGE_KEY); if (ls) { const d = safe(JSON.parse(ls)); if (d) return { ...defaults, ...d }; } } catch { /* ignore */ }
  return defaults;
}

export function useSimulator() {
  const [s, setS] = useState<Hypotheses>(defaults);
  // Hydratation client (URL/localStorage) après le rendu SSR pour éviter tout mismatch
  useEffect(() => { setS(loadInitial()); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }, [s]);

  // Callbacks stables (deps []) : sinon la value du contexte change à chaque frappe
  // et re-rend tous les consommateurs (header, nav, panneau de 20 champs).
  const update = useCallback(
    <K extends keyof Hypotheses>(k: K) => (v: Hypotheses[K]) => setS((p) => ({ ...p, [k]: v })),
    [],
  );
  const reset = useCallback(() => setS(defaults), []);
  const setPreset = useCallback((mode: Mode) => setS((p) => ({ ...p, ...PRESETS[mode], mode })), []);
  // shareLink dépend de s (sinon lien partagé périmé) → deps [s].
  const shareLink = useCallback(
    () => (typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}#s=${encodeState(s)}`),
    [s],
  );
  const m = useMemo(() => computeModel(s), [s]);
  return useMemo(
    () => ({ s, update, reset, setPreset, shareLink, m, cashOk: m.pointBas >= 0, presetIntact: isPresetIntact(s) }),
    [s, m, update, reset, setPreset, shareLink],
  );
}
