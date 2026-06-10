// @ts-nocheck
import { test, expect } from "bun:test";
import { computeModel, defaults, PRESETS, simulerRemuneration, projeter3ans, encodeState, decodeState, type Hypotheses } from "./use-simulator";

const approx = (a: number, b: number, tol = 1) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

// ---- Ancre : modèle PRUDENT (doit coller à l'Excel audité v3) ----
test("prudent SAS : chiffres = Excel audité", () => {
  const m = computeModel(defaults);
  approx(m.ca, 152400);
  approx(m.margeBrute, 27600);
  approx(m.tvaMarge, 4600);
  approx(m.fraisVar, 22440); // 935 x 24
  approx(m.contribution, 560);
  approx(m.netSoc, -5440); // perte -> IS 0
  approx(m.is, 0);
  approx(m.contribParVoiture, 23.33, 0.1);
  approx(m.seuilAn, 257.14, 0.5);
});

// ---- Mode RÉALISTE ----
test("réaliste : résultat ~ -16 410", () => {
  const m = computeModel({ ...defaults, ...PRESETS.realiste, mode: "realiste" });
  approx(m.fraisVar, 1010 * 24); // 250+50+450+135+125 = 1010
  approx(m.contribution, -1240, 5);
  approx(m.netSoc, -16408, 5);
});

// ---- Économie par voiture ----
test("contribution par voiture (prudent)", () => {
  const m = computeModel(defaults);
  approx(m.cEg, -101.67, 0.1); // entrée de gamme : PERTE
  approx(m.cCa, 315, 0.1); // Crit'Air 2 : positif
});

// ---- TVA sur marge ----
test("TVA = 20% de la marge HT (pas du prix total)", () => {
  const m = computeModel(defaults);
  approx(m.tvaMarge, m.margeBrute * 0.2 / 1.2);
});

// ---- IS : barème 15% / 25% ----
test("IS 15% sous 42 500, 25% au-delà", () => {
  // cas bénéficiaire : volume 60, sans charges -> ravis > 42500
  const base: Hypotheses = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, volume: 60 };
  const m = computeModel(base);
  const ravis = m.ravis;
  const expectedIs = 42500 * 0.15 + (ravis - 42500) * 0.25;
  expect(ravis).toBeGreaterThan(42500);
  approx(m.is, expectedIs, 1);
});

// ---- SARL : cotisations minimales si non rémunéré ----
test("SARL non rémunéré = cotisation min 1300 ; SAS = 0", () => {
  approx(computeModel({ ...defaults, statut: "SARL", remun: 0 }).cotisMin, 1300);
  approx(computeModel({ ...defaults, statut: "SAS", remun: 0 }).cotisMin, 0);
  approx(computeModel({ ...defaults, statut: "SASU", remun: 0 }).cotisMin, 0);
});

// ---- SASU : associé unique (dividendes non divisés par 3) ----
test("SASU : revenu dirigeant = tous les dividendes ; SAS = 1/3", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, distrib: 100 };
  const sas = computeModel({ ...prof, statut: "SAS" });
  const sasu = computeModel({ ...prof, statut: "SASU" });
  expect(sas.netSoc).toBeGreaterThan(0);
  approx(sas.netSoc, sasu.netSoc); // même fiscalité société
  approx(sasu.revenuDirigeant, sasu.divNet); // 1 associé
  approx(sas.revenuDirigeant, sas.divNet / 3); // 3 associés
  expect(sasu.revenuDirigeant).toBeGreaterThan(sas.revenuDirigeant);
});

// ---- SARL : dividendes pénalisés au-delà de 10% du capital ----
test("SARL : dividendes moins nets qu'en SAS (pénalité TNS)", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, distrib: 100 };
  const sas = computeModel({ ...prof, statut: "SAS" });
  const sarl = computeModel({ ...prof, statut: "SARL" });
  expect(sarl.divNet).toBeLessThan(sas.divNet);
});

// ---- Robustesse : volume 0 ne casse pas (pas de NaN) ----
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
  const mix = 0.6, vEg = 30 * 0.6, vCa = 30 * 0.4;
  const ca = vEg * 5200 + vCa * 10000;
  const achats = vEg * 4000 + vCa * 8000;
  const marge = ca - achats;
  const tva = marge * 0.2 / 1.2;
  const fv = (50 + 50 + 500 + 135 + 0) * 30;
  const contrib = marge - tva - fv;
  const cf = (300 + 50 + 150) * 12;
  const exced = contrib - cf;
  approx(m.ca, ca); approx(m.contribution, contrib); approx(m.netSoc, exced - (exced > 0 ? exced * 0.15 : 0), 1);
});

// ---- SARL : plancher de cotisations applique meme a remuneration faible ----
test("SARL : plancher cotisations 1300 sur remuneration faible", () => {
  const m = computeModel({ ...defaults, statut: "SARL", remun: 1000 });
  approx(m.chargesSoc, 450); // 1000 x 0,45
  approx(m.cotisMin, 850); // complement jusqu'au plancher
  approx(m.chargesSoc + m.cotisMin, 1300); // total social = plancher
});

// ---- SARL : dividendes > 10% capital ne sont PAS double-taxes (IR + TNS, pas PFU+TNS) ----
test("SARL : fraction dividendes > 10% capital taxee a 12,8% + 45% (pas 76%)", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, statut: "SARL" as const, distrib: 100 };
  const m = computeModel(prof);
  const seuil = 0.1 * prof.capital; // 1800
  const above = Math.max(0, m.divBrut - seuil);
  const expectFisc = Math.min(m.divBrut, seuil) * 0.314 + above * (0.128 + 0.45);
  approx(m.divFisc, expectFisc, 1);
  // taux effectif sur la fraction haute = 57,8%, pas 76,4%
  expect(above).toBeGreaterThan(0);
});

// ---- Volume courant toujours present dans les scenarios (meme hors palier) ----
test("scenarios : volume courant present et mis en evidence", () => {
  const m = computeModel({ ...defaults, volume: 30 });
  const cur = m.volScenarios.find((x) => x.current);
  expect(cur).toBeTruthy();
  expect(cur!.volume).toBe("30/an");
});

// ---- Alerte remuneration insoutenable ----
test("remuneration insoutenable detectee", () => {
  expect(computeModel({ ...defaults, remun: 60000 }).remunInsoutenable).toBe(true);
  expect(computeModel({ ...defaults, remun: 0 }).remunInsoutenable).toBe(false);
});

// ---- Mode COURTAGE : commission, sans achat ni stock ni BFR ----
test("courtage : CA = commission x volume, sans achat ni stock", () => {
  const m = computeModel({ ...defaults, activite: "courtage" });
  approx(m.ca, 600 * 24); // 14 400
  approx(m.achats, 0);
  approx(m.stockMoyen, 0);
  approx(m.bfrFinance, 0);
  approx(m.tvaMarge, 14400 * 0.2 / 1.2); // TVA 20% sur la commission
  approx(m.contribution, 7560); // 14400 - 2400 - (185 x 24)
  approx(m.netSoc, 1326, 2); // rentable la ou le stock perd -5440
  expect(m.courtage).toBe(true);
  expect(m.netSoc).toBeGreaterThan(0);
});

// ---- Courtage rentable la ou le stock perd (memes parametres) ----
test("courtage > stock sur le resultat net (prudent)", () => {
  const stock = computeModel({ ...defaults, activite: "stock" });
  const courtage = computeModel({ ...defaults, activite: "courtage" });
  expect(stock.netSoc).toBeLessThan(0);
  expect(courtage.netSoc).toBeGreaterThan(stock.netSoc);
});

// ---- Financement : ressources = capital + ARCE + pret d'honneur ----
test("financement : ARCE et pret d'honneur couvrent le BFR", () => {
  const sansAide = computeModel({ ...defaults });
  approx(sansAide.ressources, 18000);
  expect(sansAide.financementOk).toBe(false); // BFR ~20 800 > 18 000
  const avecAide = computeModel({ ...defaults, arce: 6000, pretHonneur: 10000 });
  approx(avecAide.ressources, 34000);
  expect(avecAide.financementOk).toBe(true);
});

// ---- Courtage : financement OK sans aide (pas de BFR a financer) ----
test("courtage : financement OK meme a faible capital (pas de BFR)", () => {
  const m = computeModel({ ...defaults, activite: "courtage", capital: 5000 });
  approx(m.bfrFinance, 0);
  expect(m.financementOk).toBe(true);
});

// ---- Validation d'etat : un lien/localStorage corrompu ne propage pas de NaN ----
test("decodeState : un lien valide est restitue (retro-compat)", () => {
  const link = encodeState({ ...defaults, volume: 30, statut: "SARL" });
  const d = decodeState(link);
  expect(d?.volume).toBe(30);
  expect(d?.statut).toBe("SARL");
});

test("decodeState : volume non numerique rejete -> retour aux defauts, pas de NaN", () => {
  const bad = encodeState({ ...defaults, volume: "abc" } as any);
  expect(decodeState(bad)).toBeNull(); // etat corrompu ignore
  const merged = { ...defaults, ...(decodeState(bad) ?? {}) };
  const m = computeModel(merged);
  for (const v of Object.values(m)) {
    if (typeof v === "number") expect(Number.isNaN(v)).toBe(false);
  }
});

test("decodeState : statut invalide rejete", () => {
  const bad = encodeState({ ...defaults, statut: "FOO" } as any);
  expect(decodeState(bad)).toBeNull();
});

test("decodeState : entree non base64 / JSON casse -> null sans throw", () => {
  expect(decodeState("pas-du-base64-!!")).toBeNull();
});

// ---- Nombre d'associes parametrable, synchronise partout ----
test("nbAssocies : dividendes partages selon le nombre d'associes saisi", () => {
  const prof = { ...defaults, garantie: 0, decote: 0, prep: 0, transport: 0, petits: 0, local: 0, assur: 0, autres: 0, distrib: 100 };
  const a3 = computeModel({ ...prof, nbAssocies: 3 });
  const a4 = computeModel({ ...prof, nbAssocies: 4 });
  approx(a3.nAssoc, 3); approx(a4.nAssoc, 4);
  approx(a3.revenuDirigeant, a3.divNet / 3);
  approx(a4.revenuDirigeant, a4.divNet / 4);
  // SASU ignore nbAssocies : toujours unipersonnelle
  const su = computeModel({ ...prof, statut: "SASU", nbAssocies: 5 });
  approx(su.nAssoc, 1);
  approx(su.revenuDirigeant, su.divNet);
});

// ---- ACRE : reduction des charges sociales annee 1 ----
test("ACRE : charges sociales reduites de 50% (opts.acre)", () => {
  const plein = computeModel({ ...defaults, statut: "SAS", remun: 10000 });
  const acre = computeModel({ ...defaults, statut: "SAS", remun: 10000 }, { acre: 0.5 });
  approx(plein.chargesSoc, 8000); // 10000 x 0,8
  approx(acre.chargesSoc, 4000); // moitie avec ACRE
  expect(acre.netSoc).toBeGreaterThan(plein.netSoc); // moins de charges -> meilleur resultat
});

// ---- Projection 3 ans : montee en charge, CFE des l'an 2, ACRE an 1 ----
test("projeter3ans : volume monte, CFE 0 an1 puis due, ACRE an1", () => {
  const p = projeter3ans({ ...defaults, croissance: 30, acre: true, cfe: 300 });
  expect(p.length).toBe(3);
  approx(p[0].volume, 24); approx(p[1].volume, 31); approx(p[2].volume, 41); // x1,3 par an
  approx(p[0].cfe, 0); approx(p[1].cfe, 300); approx(p[2].cfe, 300); // exoneree an1
  expect(p[0].acreActive).toBe(true);
  expect(p[1].acreActive).toBe(false);
  approx(p[0].netSoc, -5440); // an1 prudent SAS sans salaire = ancre connue
});

test("simulerRemuneration : plusieurs associes remuneres (cout x N)", () => {
  // 3 associes remuneres a 5 600 net en SARL : cout = 3 x 5600 x 1,45 (cotis min couverte)
  const r = simulerRemuneration(30000, 18000, "SARL", 5600, { nbAssocies: 3, nbRemuneres: 3 });
  approx(r.salaireTotal, 16800);
  approx(r.chargesSoc, 16800 * 0.45);
  approx(r.cotisMin, 0); // gerant remunere : ses cotisations (2520) depassent le plancher
  approx(r.coutSalaire, 16800 * 1.45);
  approx(r.baseIS, 30000 - 16800 * 1.45);
  // SASU : nbRemuneres plafonne a 1 associe
  const su = simulerRemuneration(30000, 18000, "SASU", 5600, { nbAssocies: 3, nbRemuneres: 3 });
  approx(su.nbRemuneres, 1);
  approx(su.salaireTotal, 5600);
});

// ---- Simulation juridique : parite avec le fichier Excel corrige (benefice 30 000, capital 18 000) ----
test("simulerRemuneration SARL tous dividendes = Excel corrige (10 769,89)", () => {
  const r = simulerRemuneration(30000, 18000, "SARL", 0);
  approx(r.cotisMin, 1300); // gerant non remunere : plancher TNS
  approx(r.baseIS, 28700); // 30000 - 1300
  approx(r.is, 4305); // 15% de 28700
  approx(r.distribuable, 24395);
  approx(r.divNet, 10769.89, 0.5); // part>1800 a 45% TNS + 12,8% IR (PAS le PFU plein)
});

test("simulerRemuneration SAS tous dividendes (flat tax 31,4%)", () => {
  const r = simulerRemuneration(30000, 18000, "SAS", 0);
  approx(r.cotisMin, 0);
  approx(r.is, 4500); // 15% de 30000
  approx(r.distribuable, 25500);
  approx(r.divNet, 25500 * (1 - 0.314), 0.5); // 17 493
});

test("simulerRemuneration : SASU garde tous les dividendes, SAS partage par 3", () => {
  const sas = simulerRemuneration(30000, 18000, "SAS", 0);
  const sasu = simulerRemuneration(30000, 18000, "SASU", 0);
  approx(sasu.divNet, sas.divNet); // meme fiscalite societe
  approx(sasu.revenuNetDirigeant, sasu.divNet); // 1 associe
  approx(sas.revenuNetDirigeant, sas.divNet / 3); // 3 associes
  expect(sasu.revenuNetDirigeant).toBeGreaterThan(sas.revenuNetDirigeant);
});
