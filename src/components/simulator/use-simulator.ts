import { useMemo, useState } from "react";

export const TVA = 0.2;
export const SAS_SOC = 0.8;
export const SARL_SOC = 0.45;
export const COTIS_MIN = 1200;
export const FLAT = 0.3;
export const SARL_DIV = 0.45;

export const eur = (n: number) =>
  (Math.round(n) === 0 ? "0" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))) + " €";
export const pct = (n: number) => (n * 100).toFixed(1) + " %";
export const num = (n: number, d = 1) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(n);

const isTax = (r: number) => (r > 0 ? Math.min(r, 42500) * 0.15 + Math.max(0, r - 42500) * 0.25 : 0);

export type Statut = "SAS" | "SARL";

export const defaults = {
  achatEg: 4000, reventeEg: 5500, achatCa: 8000, reventeCa: 10000,
  prep: 50, transport: 50, garantie: 250, petits: 135,
  local: 300, assur: 50, autres: 150,
  volume: 24, mixEg: 70, rotation: 1, capital: 18000,
  statut: "SAS" as Statut, remun: 0, distrib: 0, apresVente: 0, cfe: 0,
};
export type Hypotheses = typeof defaults;

export function useSimulator() {
  const [s, setS] = useState<Hypotheses>(defaults);
  const update = <K extends keyof Hypotheses>(k: K) => (v: Hypotheses[K]) =>
    setS((p) => ({ ...p, [k]: v }));
  const reset = () => setS(defaults);

  const m = useMemo(() => {
    const mix = s.mixEg / 100;
    const volEg = s.volume * mix, volCa = s.volume * (1 - mix);
    const ca = volEg * s.reventeEg + volCa * s.reventeCa;
    const achats = volEg * s.achatEg + volCa * s.achatCa;
    const margeBrute = ca - achats;
    const tvaMarge = margeBrute * TVA / (1 + TVA);
    const fvUnit = s.prep + s.transport + s.garantie + s.petits;
    const fraisVar = s.volume * fvUnit;
    const contribution = margeBrute - tvaMarge - fraisVar;
    const chargesFixesAn = (s.local + s.assur + s.autres) * 12;
    const excedent = contribution - chargesFixesAn - s.cfe;
    const tauxSoc = s.statut === "SARL" ? SARL_SOC : SAS_SOC;
    const chargesSoc = s.remun * tauxSoc;
    const cotisMin = s.statut === "SARL" && s.remun === 0 ? COTIS_MIN : 0;
    const ravis = excedent - s.remun - chargesSoc - cotisMin;
    const is = isTax(ravis);
    const netSoc = ravis - is;
    const divBrut = Math.max(0, netSoc) * (s.distrib / 100);
    const divFisc = divBrut * FLAT + (s.statut === "SARL" ? Math.max(0, divBrut - 0.1 * s.capital) * SARL_DIV : 0);
    const divNet = divBrut - divFisc;
    const netConserve = netSoc - divBrut;
    const revenuDirigeant = s.remun + divNet / 3;
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
    const remunM = (s.remun * (1 + tauxSoc) + cotisMin) / 12;
    const lag = Math.max(0, Math.round(s.rotation));
    const treso: { mois: string; treso: number }[] = []; let prev = s.capital;
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
    const volScenarios = [12, 24, 36, 48, 60].map((v) => {
      const cM = v * (mix * cEg + (1 - mix) * cCa);
      const rav = cM - chargesFixesAn - s.cfe - s.remun - chargesSoc - cotisMin;
      return { volume: v + "/an", net: Math.round(rav - isTax(rav)), current: v === s.volume };
    });
    return {
      ca, achats, margeBrute, tvaMarge, fraisVar, contribution, chargesFixesAn,
      excedent, chargesSoc, cotisMin, ravis, is, netSoc, divBrut, divFisc, divNet,
      netConserve, revenuDirigeant, tMargeBrute, tContribution, tMargeNette,
      contribParVoiture, seuilAn, treso, pointBas, stockMoyen, bfrFinance,
      rotationStock, roi, volScenarios, cEg, cCa,
    };
  }, [s]);

  return { s, update, reset, m, cashOk: m.pointBas >= 0 };
}
