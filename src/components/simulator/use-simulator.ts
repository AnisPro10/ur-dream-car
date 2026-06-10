import { useMemo, useState } from "react";

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
export type TresoPoint = { mois: string; treso: number };
export type VolumeScenario = { volume: string; net: number; current: boolean };

// Presets de charges : prudent (modèle audité v3) vs réaliste (toutes charges réelles)
export const PRESETS = {
  prudent: { prep: 50, transport: 50, garantie: 700, petits: 135, decote: 0, local: 300, assur: 50, autres: 150 },
  realiste: { prep: 250, transport: 50, garantie: 450, petits: 135, decote: 125, local: 500, assur: 200, autres: 564 },
} as const;
export const PRESET_KEYS = Object.keys(PRESETS.prudent) as (keyof typeof PRESETS.prudent)[];

export const defaults = {
  achatEg: 4000, reventeEg: 5000, achatCa: 8000, reventeCa: 9500,
  ...PRESETS.prudent,
  volume: 24, mixEg: 70, rotation: 2, capital: 18000,
  statut: "SAS" as Statut, remun: 0, distrib: 0, apresVente: 0, cfe: 0,
  mode: "prudent" as Mode,
};
export type Hypotheses = typeof defaults;

export interface ModelResult {
  ca: number; achats: number; margeBrute: number; tvaMarge: number; fraisVar: number;
  contribution: number; chargesFixesAn: number; excedent: number; chargesSoc: number;
  cotisMin: number; coutRemun: number; remunInsoutenable: boolean; ravis: number; is: number;
  netSoc: number; divBrut: number; divFisc: number; divNet: number; netConserve: number;
  revenuDirigeant: number; nAssoc: number; tMargeBrute: number; tContribution: number;
  tMargeNette: number; contribParVoiture: number; seuilAn: number; treso: TresoPoint[];
  pointBas: number; stockMoyen: number; bfrFinance: number; rotationStock: number; roi: number;
  volScenarios: VolumeScenario[]; cEg: number; cCa: number;
}

// Fonction de calcul PURE (testable indépendamment de React)
export function computeModel(s: Hypotheses): ModelResult {
  const mix = s.mixEg / 100;
  const volEg = s.volume * mix, volCa = s.volume * (1 - mix);
  const ca = volEg * s.reventeEg + volCa * s.reventeCa;
  const achats = volEg * s.achatEg + volCa * s.achatCa;
  const margeBrute = ca - achats;
  const tvaMarge = margeBrute * TVA / (1 + TVA);
  const fvUnit = s.prep + s.transport + s.garantie + s.petits + s.decote;
  const fraisVar = s.volume * fvUnit;
  const contribution = margeBrute - tvaMarge - fraisVar;
  const chargesFixesAn = (s.local + s.assur + s.autres) * 12;
  const excedent = contribution - chargesFixesAn - s.cfe;
  const isSarl = s.statut === "SARL";
  const tauxSoc = isSarl ? SARL_SOC : SAS_SOC;
  const chargesSoc = s.remun * tauxSoc;
  // SARL : plancher de cotisations minimales appliqué sur toute la plage de rémunérations faibles
  const cotisMin = isSarl ? Math.max(0, COTIS_MIN - chargesSoc) : 0;
  const coutRemun = s.remun + chargesSoc + cotisMin;
  // Rémunération insoutenable : son coût total dépasse ce que l'activité dégage avant rémunération
  const remunInsoutenable = s.remun > 0 && coutRemun > Math.max(0, excedent);
  const ravis = excedent - s.remun - chargesSoc - cotisMin;
  const is = isTax(ravis);
  const netSoc = ravis - is;
  const divBrut = Math.max(0, netSoc) * (s.distrib / 100);
  // Fiscalité dividendes : SAS/SASU = PFU 31,4 % ; SARL = PFU sous 10 % du capital,
  // puis IR 12,8 % + cotisations TNS 45 % (qui REMPLACENT les prélèvements sociaux) au-delà.
  const seuilDiv = 0.1 * s.capital;
  const divBelow = Math.min(divBrut, seuilDiv);
  const divAbove = Math.max(0, divBrut - seuilDiv);
  const divFisc = isSarl ? divBelow * FLAT + divAbove * (PFU_IR + SARL_DIV) : divBrut * FLAT;
  const divNet = divBrut - divFisc;
  const netConserve = netSoc - divBrut;
  const nAssoc = s.statut === "SASU" ? 1 : NB_ASSOCIES; // SASU = associé unique
  const revenuDirigeant = s.remun + divNet / nAssoc;
  const tMargeBrute = ca ? margeBrute / ca : 0;
  const tContribution = ca ? contribution / ca : 0;
  const tMargeNette = ca ? netSoc / ca : 0;
  const contribParVoiture = s.volume ? contribution / s.volume : 0;
  const seuilAn = contribParVoiture ? chargesFixesAn / contribParVoiture : 0;
  const wAchat = mix * s.achatEg + (1 - mix) * s.achatCa;
  const wRevente = mix * s.reventeEg + (1 - mix) * s.reventeCa;
  const mVol = s.volume / 12;
  const achatsM = mVol * wAchat, ventesM = mVol * wRevente;
  const p = s.apresVente / 100;
  const comptantM = achatsM * (1 - p), diffM = achatsM * p;
  const fvM = mVol * fvUnit, tvaM = mVol * (wRevente - wAchat) * TVA / (1 + TVA);
  const fixeM = s.local + s.assur + s.autres;
  const remunM = coutRemun / 12;
  const lag = Math.max(0, Math.round(s.rotation));
  const treso: TresoPoint[] = []; let prev = s.capital;
  for (let i = 0; i < 12; i++) {
    const on = i >= lag;
    const fin = prev + (on ? ventesM : 0) - comptantM - (on ? diffM : 0) - (on ? fvM : 0) - (on ? tvaM : 0) - fixeM - remunM - (i === 11 ? s.cfe : 0);
    treso.push({ mois: "M" + (i + 1), treso: Math.round(fin) }); prev = fin;
  }
  const pointBas = Math.min(...treso.map((x) => x.treso));
  const stockMoyen = achatsM * s.rotation;
  const bfrFinance = stockMoyen * (1 - p);
  const rotationStock = stockMoyen ? achats / stockMoyen : 0;
  const roi = s.capital ? netSoc / s.capital : 0;
  const cEg = (s.reventeEg - s.achatEg) - (s.reventeEg - s.achatEg) * TVA / (1 + TVA) - fvUnit;
  const cCa = (s.reventeCa - s.achatCa) - (s.reventeCa - s.achatCa) * TVA / (1 + TVA) - fvUnit;
  // Le volume courant est toujours présent et mis en évidence, même hors palier
  const vols = Array.from(new Set([12, 24, 36, 48, 60, s.volume])).sort((a, b) => a - b);
  const volScenarios: VolumeScenario[] = vols.map((v) => {
    const cM = v * (mix * cEg + (1 - mix) * cCa);
    const rav = cM - chargesFixesAn - s.cfe - s.remun - chargesSoc - (isSarl ? Math.max(0, COTIS_MIN - s.remun * SARL_SOC) : 0);
    return { volume: v + "/an", net: Math.round(rav - isTax(rav)), current: v === s.volume };
  });
  return {
    ca, achats, margeBrute, tvaMarge, fraisVar, contribution, chargesFixesAn,
    excedent, chargesSoc, cotisMin, coutRemun, remunInsoutenable, ravis, is, netSoc,
    divBrut, divFisc, divNet, netConserve, revenuDirigeant, nAssoc, tMargeBrute,
    tContribution, tMargeNette, contribParVoiture, seuilAn, treso, pointBas, stockMoyen,
    bfrFinance, rotationStock, roi, volScenarios, cEg, cCa,
  };
}

// Une charge est "personnalisée" si elle diverge du preset du mode courant
export function isPresetIntact(s: Hypotheses): boolean {
  return PRESET_KEYS.every((k) => s[k] === PRESETS[s.mode][k]);
}

export function useSimulator() {
  const [s, setS] = useState<Hypotheses>(defaults);
  const update = <K extends keyof Hypotheses>(k: K) => (v: Hypotheses[K]) =>
    setS((p) => ({ ...p, [k]: v }));
  const reset = () => setS(defaults);
  // Bascule un préréglage de charges (prudent / réaliste) sans toucher aux prix ni au volume
  const setPreset = (mode: Mode) => setS((p) => ({ ...p, ...PRESETS[mode], mode }));
  const m = useMemo(() => computeModel(s), [s]);
  return { s, update, reset, setPreset, m, cashOk: m.pointBas >= 0, presetIntact: isPresetIntact(s) };
}
