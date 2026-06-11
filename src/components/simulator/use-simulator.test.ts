// @ts-nocheck
import { test, expect } from "bun:test";
import { computeModel, defaults, PRESETS, simulerRemuneration, projeter5ans, encodeState, decodeState, type Hypotheses } from "./use-simulator";

const approx = (a: number, b: number, tol = 1) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

// ============================================================================
// PARITÉ EXCEL — les ancres ci-dessous sont les chiffres exacts du classeur
// Previsionnel_Auto_Occasion_v3.xlsx (recalcul indépendant validé par audit).
// Mêmes entrées => mêmes sorties, à l'arrondi près.
// ============================================================================

// ---- Ancre : scénario PRUDENT (= onglet Hypothèses/Résultat de l'Excel) ----
test("parité Excel — prudent SAS : CA 78 720, net 1 496", () => {
  const m = computeModel(defaults);
  approx(m.ca, 78720);
  approx(m.achats, 61200);
  approx(m.margeBrute, 17520);
  approx(m.tvaMarge, 2920);
  approx(m.fraisVar, 8040); // 335 x 24
  approx(m.contribution, 6560);
  approx(m.chargesFixesAn, 4800);
  approx(m.is, 264);
  approx(m.netSoc, 1496);
  approx(m.contribParVoiture, 273.33, 0.1);
});

// ---- Ancre : scénario RÉALISTE (= colonne réaliste du Comparatif Excel : -24 810) ----
test("parité Excel — réaliste : résultat ≈ -24 808", () => {
  const m = computeModel({ ...defaults, ...PRESETS.realiste, mode: "realiste" });
  approx(m.fraisVar, 1010 * 24);
  approx(m.chargesFixesAn, 15168); // (500+200+564) x 12
  approx(m.netSoc, -24808, 3); // Excel Comparatif!C46 = -24 810 (arrondi)
});

// ---- Ancre : économie par véhicule ----
test("parité Excel — contribution/véhicule : EG +248,3 ; 2e segment +498,3", () => {
  const m = computeModel(defaults);
  approx(m.cEg, 248.33, 0.1);
  approx(m.cCa, 498.33, 0.1);
});

// ---- Ancre : BFR = stock + frais engagés (Ratios!B21 / BFR_Financement!B10) ----
test("parité Excel — BFR 11 140 (stock 10 200 + frais engagés 940)", () => {
  const m = computeModel(defaults);
  approx(m.stockMoyen, 10200);
  approx(m.bfrFinance, 11140);
  expect(m.financementOk).toBe(true); // capital 20 000 > 11 140
});

// ---- Ancre : trésorerie (clôture M12 de l'Excel = 10 466,67) ----
test("parité Excel — trésorerie de clôture ≈ 10 467", () => {
  const m = computeModel(defaults);
  approx(m.treso[11].treso, 10467, 2);
});

// ---- TVA sur marge (régime 297 A) ----
test("TVA = 20 % de la marge ramenée HT (pas du prix total)", () => {
  const m = computeModel(defaults);
  approx(m.tvaMarge, m.margeBrute * 0.2 / 1.2);
});

// ---- IS : barème 15 % / 25 % ----
test("IS 15 % sous 42 500, 25 % au-delà", () => {
  const base: Hypotheses = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, volume: 200 };
  const m = computeModel(base);
  expect(m.ravis).toBeGreaterThan(42500);
  approx(m.is, 42500 * 0.15 + (m.ravis - 42500) * 0.25, 1);
});

// ---- Cotisations minimales SARL : règle Excel (dues uniquement si non rémunéré) ----
test("SARL : cotis min 1 300 si gérant NON rémunéré ; 0 sinon (règle Excel)", () => {
  approx(computeModel({ ...defaults, statut: "SARL", remun: 0 }).cotisMin, 1300);
  approx(computeModel({ ...defaults, statut: "SARL", remun: 1000 }).cotisMin, 0);
  approx(computeModel({ ...defaults, statut: "SARL", remun: 1000 }).chargesSoc, 450);
  approx(computeModel({ ...defaults, statut: "SAS", remun: 0 }).cotisMin, 0);
  approx(computeModel({ ...defaults, statut: "SASU", remun: 0 }).cotisMin, 0);
});

// ---- SASU : associé unique ----
test("SASU : revenu dirigeant = tous les dividendes ; SAS = 1/3", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, distrib: 100 };
  const sas = computeModel({ ...prof, statut: "SAS" });
  const sasu = computeModel({ ...prof, statut: "SASU" });
  expect(sas.netSoc).toBeGreaterThan(0);
  approx(sas.netSoc, sasu.netSoc);
  approx(sasu.revenuDirigeant, sasu.divNet);
  approx(sas.revenuDirigeant, sas.divNet / 3);
});

// ---- SARL : dividendes > 10 % du capital (12,8 % IR + 45 % TNS, pas de double PS) ----
test("SARL : fraction > 10 % du capital taxée à 12,8 % + 45 %", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, statut: "SARL" as const, distrib: 100, remun: 1000 };
  const m = computeModel(prof);
  const seuil = 0.1 * prof.capital; // 2 000
  const above = Math.max(0, m.divBrut - seuil);
  expect(above).toBeGreaterThan(0);
  approx(m.divFisc, Math.min(m.divBrut, seuil) * 0.314 + above * (0.128 + 0.45), 1);
});

// ---- Robustesse ----
test("volume 0 : pas de NaN", () => {
  const m = computeModel({ ...defaults, volume: 0 });
  for (const [k, v] of Object.entries(m)) {
    if (typeof v === "number") expect(Number.isNaN(v), `${k} est NaN`).toBe(false);
  }
});

// ---- Recoupement indépendant complet d'un cas custom ----
test("recoupement indépendant (cas custom)", () => {
  const s: Hypotheses = { ...defaults, reventeEg: 5200, reventeCa: 10000, volume: 30, mixEg: 60, garantie: 500, remun: 0 };
  const m = computeModel(s);
  const vEg = 18, vCa = 12;
  const ca = vEg * 5200 + vCa * 10000; // 213 600
  const achats = vEg * 2500 + vCa * 3000; // 81 000
  const marge = ca - achats;
  const tva = marge * 0.2 / 1.2;
  const fv = (50 + 50 + 500 + 135 + 0) * 30;
  const contrib = marge - tva - fv;
  const exced = contrib - 4800;
  const is = 42500 * 0.15 + (exced - 42500) * 0.25;
  approx(m.ca, ca); approx(m.contribution, contrib); approx(m.netSoc, exced - is, 1);
});

// ---- Scénarios de volume ----
test("scénarios : volume courant présent et mis en évidence", () => {
  const m = computeModel({ ...defaults, volume: 30 });
  const cur = m.volScenarios.find((x) => x.current);
  expect(cur).toBeTruthy();
  expect(cur!.volume).toBe("30/an");
});

// ---- Alerte rémunération insoutenable ----
test("rémunération insoutenable détectée", () => {
  expect(computeModel({ ...defaults, remun: 60000 }).remunInsoutenable).toBe(true);
  expect(computeModel({ ...defaults, remun: 0 }).remunInsoutenable).toBe(false);
});

// ---- Mode COURTAGE ----
test("courtage : CA = commission x volume, sans achat ni stock ; net 2 346", () => {
  const m = computeModel({ ...defaults, activite: "courtage" });
  approx(m.ca, 14400);
  approx(m.achats, 0);
  approx(m.stockMoyen, 0);
  approx(m.bfrFinance, 0);
  approx(m.tvaMarge, 2400);
  approx(m.contribution, 7560);
  approx(m.netSoc, 2346, 2); // excédent 2 760 - IS 414
  expect(m.courtage).toBe(true);
});

test("courtage > stock sur le résultat net (mêmes paramètres)", () => {
  const stock = computeModel({ ...defaults, activite: "stock" });
  const courtage = computeModel({ ...defaults, activite: "courtage" });
  approx(stock.netSoc, 1496);
  expect(courtage.netSoc).toBeGreaterThan(stock.netSoc);
});

// ---- Financement : ressources vs BFR ----
test("financement : capital 20 000 couvre le BFR ; 10 000 non, sauf avec ARCE/prêt", () => {
  const base = computeModel({ ...defaults });
  approx(base.ressources, 20000);
  expect(base.financementOk).toBe(true); // BFR 11 140 < 20 000
  const faible = computeModel({ ...defaults, capital: 10000 });
  expect(faible.financementOk).toBe(false); // 10 000 < 11 140
  const aide = computeModel({ ...defaults, capital: 10000, arce: 2000 });
  expect(aide.financementOk).toBe(true); // 12 000 > 11 140
});

// ---- ACRE (option hors Excel, désactivée par défaut) ----
test("ACRE : charges sociales réduites de 50 % via opts.acre ; défaut = off", () => {
  expect(defaults.acre).toBe(false);
  const plein = computeModel({ ...defaults, statut: "SAS", remun: 10000 });
  const acre = computeModel({ ...defaults, statut: "SAS", remun: 10000 }, { acre: 0.5 });
  approx(plein.chargesSoc, 8000);
  approx(acre.chargesSoc, 4000);
});

// ---- Projection 5 ans (parité Excel Projection_5ans : volume NON arrondi) ----
test("parité Excel — projeter5ans : volumes exacts, CFE dès l'an 2, rému an 4-5", () => {
  const p = projeter5ans(defaults);
  expect(p.length).toBe(5);
  approx(p[0].volume, 24); approx(p[1].volume, 31.2, 0.01); approx(p[2].volume, 43.68, 0.01);
  approx(p[3].volume, 56.784, 0.01); approx(p[4].volume, 68.1408, 0.01);
  approx(p[0].cfe, 0); approx(p[1].cfe, 300); approx(p[4].cfe, 300);
  approx(p[0].netSoc, 1496);
  approx(p[1].netSoc, 2913.8, 1);
  approx(p[2].netSoc, 5813.3, 1);
  approx(p[3].remun, 12000); // rémunération année 4
  approx(p[3].netSoc, -11179, 2); // 12 000 nets coûtent 21 600 : déficit
  expect(p[0].acreActive).toBe(false); // parité Excel : pas d'ACRE par défaut
});

// ---- Validation d'état (URL / localStorage) ----
test("decodeState : un lien valide est restitué", () => {
  const link = encodeState({ ...defaults, volume: 30, statut: "SARL" });
  const d = decodeState(link);
  expect(d?.volume).toBe(30);
  expect(d?.statut).toBe("SARL");
});

test("decodeState : état corrompu rejeté, pas de NaN", () => {
  const bad = encodeState({ ...defaults, volume: "abc" } as any);
  expect(decodeState(bad)).toBeNull();
  expect(decodeState("pas-du-base64-!!")).toBeNull();
  const m = computeModel({ ...defaults, ...(decodeState(bad) ?? {}) });
  for (const v of Object.values(m)) {
    if (typeof v === "number") expect(Number.isNaN(v)).toBe(false);
  }
});

// ---- Nombre d'associés ----
test("nbAssocies : dividendes partagés selon le nombre saisi ; SASU = 1", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, distrib: 100 };
  const a4 = computeModel({ ...prof, nbAssocies: 4 });
  approx(a4.nAssoc, 4);
  approx(a4.revenuDirigeant, a4.divNet / 4);
  const su = computeModel({ ...prof, statut: "SASU", nbAssocies: 5 });
  approx(su.nAssoc, 1);
});

// ============================================================================
// PARITÉ EXCEL JURIDIQUE — Simulation_Juridique_Remuneration.xlsx
// (bénéfice 30 000, capital 20 000 — chiffres validés par l'audit juridique)
// ============================================================================

test("parité Excel juridique — SARL tous dividendes : net 10 822,69", () => {
  const r = simulerRemuneration(30000, 20000, "SARL", 0);
  approx(r.cotisMin, 1300);
  approx(r.baseIS, 28700);
  approx(r.is, 4305);
  approx(r.distribuable, 24395);
  approx(r.divNet, 10822.69, 0.5); // = Excel SARL_a3!B13
});

test("parité Excel juridique — SAS tous dividendes : net 17 493", () => {
  const r = simulerRemuneration(30000, 20000, "SAS", 0);
  approx(r.cotisMin, 0);
  approx(r.is, 4500);
  approx(r.distribuable, 25500);
  approx(r.divNet, 17493, 0.5); // = Excel SAS_a3!B13
});

test("parité Excel juridique — règle cotis min : 0 dès qu'un salaire existe", () => {
  const r = simulerRemuneration(30000, 20000, "SARL", 5600, { nbAssocies: 3, nbRemuneres: 1 });
  approx(r.cotisMin, 0); // règle Excel : IF(salaire=0 ; 1300 ; 0)
  approx(r.chargesSoc, 5600 * 0.45);
});

test("simulerRemuneration : plusieurs associés rémunérés (coût x N)", () => {
  const r = simulerRemuneration(30000, 20000, "SARL", 5600, { nbAssocies: 3, nbRemuneres: 3 });
  approx(r.salaireTotal, 16800);
  approx(r.coutSalaire, 16800 * 1.45);
  const su = simulerRemuneration(30000, 20000, "SASU", 5600, { nbAssocies: 3, nbRemuneres: 3 });
  approx(su.nbRemuneres, 1); // SASU plafonnée à 1 associé
});

test("simulerRemuneration : SASU garde tous les dividendes, SAS partage", () => {
  const sas = simulerRemuneration(30000, 20000, "SAS", 0);
  const sasu = simulerRemuneration(30000, 20000, "SASU", 0);
  approx(sasu.divNet, sas.divNet);
  approx(sasu.revenuNetDirigeant, sasu.divNet);
  approx(sas.revenuNetDirigeant, sas.divNet / 3);
});
