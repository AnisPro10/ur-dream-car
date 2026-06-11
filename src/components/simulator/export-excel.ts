import type { Sim } from "./simulator-context";
import { projeter5ans, pct } from "./use-simulator";

// Export d'un vrai classeur Excel (.xlsx) mis en forme : feuilles séparées, titres,
// en-têtes colorés, formats € / %, largeurs de colonnes, négatifs en rouge.
// exceljs est chargé à la demande (import dynamique) pour ne pas alourdir le bundle.

const BRAND = "FF1F6F78"; // teal pétrole (thème)
const LIGHT = "FFE9F1F2"; // teal très clair (fonds de section)
const ZEBRA = "FFF6F8F8";
const EUR = '#,##0 "€";[Red]-#,##0 "€"';
const INT = "#,##0";

type AnyWS = import("exceljs").Worksheet;
type AnyRow = import("exceljs").Row;

function title(ws: AnyWS, cols: number, text: string) {
  const r = ws.addRow([text]);
  ws.mergeCells(r.number, 1, r.number, cols);
  const c = r.getCell(1);
  c.font = { bold: true, size: 15, color: { argb: BRAND } };
  r.height = 24;
}

function subtitle(ws: AnyWS, cols: number, text: string) {
  const r = ws.addRow([text]);
  ws.mergeCells(r.number, 1, r.number, cols);
  r.getCell(1).font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
}

function section(ws: AnyWS, cols: number, text: string) {
  ws.addRow([]);
  const r = ws.addRow([text]);
  ws.mergeCells(r.number, 1, r.number, cols);
  const c = r.getCell(1);
  c.font = { bold: true, color: { argb: BRAND } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
  r.height = 18;
}

function header(ws: AnyWS, cells: string[]) {
  const r = ws.addRow(cells);
  r.eachCell((c, col) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    c.alignment = { horizontal: col === 1 ? "left" : "right" };
  });
  r.height = 17;
}

type RowOpts = { strong?: boolean; fmt?: string; zebra?: boolean };
function dataRow(ws: AnyWS, label: string, values: (number | string)[], opts: RowOpts = {}) {
  const r: AnyRow = ws.addRow([label, ...values]);
  r.eachCell((c, col) => {
    c.border = { bottom: { style: "thin", color: { argb: "FFE5E7EB" } } };
    if (opts.zebra) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
    if (col === 1) {
      c.font = { bold: !!opts.strong, color: { argb: opts.strong ? "FF111827" : "FF374151" } };
      c.alignment = { horizontal: "left", wrapText: false };
    } else {
      c.alignment = { horizontal: "right" };
      c.font = { bold: !!opts.strong, color: { argb: "FF111827" } };
      if (typeof c.value === "number" && opts.fmt !== "raw") c.numFmt = opts.fmt ?? EUR;
    }
  });
}

export async function downloadExcel(sim: Sim) {
  if (typeof window === "undefined") return;
  const mod: any = await import("exceljs");
  const ExcelJS = mod.default ?? mod;
  const { s, m } = sim;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Simulateur négoce VO";

  const dirigeant = `${s.dirigeantPrenom} ${s.dirigeantNom}`.trim() || "—";
  const stamp = `${s.statut} · ${s.activite === "courtage" ? "courtage" : "stock"} · ${s.mode === "realiste" ? "réaliste" : "prudent"} · ${m.nAssoc} associé${m.nAssoc > 1 ? "s" : ""}`;

  // ---- Feuille 1 : Synthèse ----
  const wsS = wb.addWorksheet("Synthèse", { views: [{ showGridLines: false }] });
  wsS.columns = [{ width: 34 }, { width: 18 }];
  title(wsS, 2, "Simulateur négoce VO — synthèse");
  subtitle(wsS, 2, `Dirigeant : ${dirigeant}  ·  ${stamp}`);
  section(wsS, 2, "Indicateurs clés");
  header(wsS, ["Indicateur", "Valeur"]);
  dataRow(wsS, "Résultat net société", [m.netSoc], { strong: true });
  dataRow(wsS, "Revenu net dirigeant", [m.revenuDirigeant], { zebra: true });
  dataRow(wsS, "Marge nette", [pct(m.tMargeNette)], { fmt: "raw" });
  dataRow(wsS, "Marge brute", [pct(m.tMargeBrute)], { fmt: "raw", zebra: true });
  dataRow(wsS, "Point bas de trésorerie", [m.pointBas], { strong: true });
  dataRow(wsS, "Ressources (capital + ARCE + prêt)", [m.ressources], { zebra: true });
  dataRow(wsS, "Couverture du BFR", [m.courtage ? "Sans BFR" : m.financementOk ? "Financé" : "Insuffisant"], { fmt: "raw" });
  dataRow(wsS, "ROI du capital", [pct(m.roi)], { fmt: "raw", zebra: true });

  // ---- Feuille 2 : Compte de résultat ----
  const wsR = wb.addWorksheet("Compte de résultat", { views: [{ showGridLines: false }] });
  wsR.columns = [{ width: 36 }, { width: 18 }];
  title(wsR, 2, "Compte de résultat");
  subtitle(wsR, 2, stamp);
  section(wsR, 2, "Exploitation");
  header(wsR, ["Poste", "Montant"]);
  let z = false;
  const R = (label: string, v: number, strong = false) => { dataRow(wsR, label, [v], { strong, zebra: z }); z = !z; };
  R(s.activite === "courtage" ? "Commissions encaissées" : "Chiffre d'affaires", m.ca, true);
  if (!m.courtage) { R("− Coût d'achat", -m.achats); R("Marge brute", m.margeBrute, true); }
  R(m.courtage ? "− TVA (20 % sur commission)" : "− TVA sur marge", -m.tvaMarge);
  R("− Frais variables", -m.fraisVar);
  R("Contribution", m.contribution, true);
  R("− Charges fixes", -m.chargesFixesAn);
  R("− CFE", -s.cfe);
  R("− Rémunération dirigeant", -s.remun);
  R("− Charges sociales", -m.chargesSoc);
  if (m.cotisMin > 0) R("− Cotisations min. (SARL)", -m.cotisMin);
  R("− Impôt (IS)", -m.is);
  R("Résultat net société", m.netSoc, true);
  section(wsR, 2, "Revenu des associés");
  header(wsR, ["Poste", "Montant"]);
  z = false;
  R("Dividendes bruts distribués", m.divBrut);
  R("− Fiscalité dividendes", -m.divFisc);
  R("Dividendes nets (total)", m.divNet, true);
  R("Dividendes nets / associé", m.divNet / m.nAssoc);
  R("Revenu net dirigeant", m.revenuDirigeant, true);

  // ---- Feuille 3 : Trésorerie ----
  const wsT = wb.addWorksheet("Trésorerie", { views: [{ showGridLines: false }] });
  wsT.columns = [{ width: 16 }, { width: 20 }, { width: 16 }];
  title(wsT, 3, "Trésorerie mois par mois");
  subtitle(wsT, 3, `Départ ${Math.round(m.ressources).toLocaleString("fr-FR")} €  ·  point bas ${Math.round(m.pointBas).toLocaleString("fr-FR")} €`);
  section(wsT, 3, "Évolution sur 12 mois");
  header(wsT, ["Mois", "Trésorerie fin de mois", "Variation"]);
  dataRow(wsT, "Départ", [m.ressources, ""], {});
  let prev = m.ressources;
  m.treso.forEach((p, i) => {
    dataRow(wsT, p.mois, [p.treso, p.treso - prev], { zebra: i % 2 === 0 });
    prev = p.treso;
  });
  dataRow(wsT, "Point bas", [m.pointBas, ""], { strong: true });

  // ---- Feuille 4 : Projection 5 ans ----
  const wsP = wb.addWorksheet("Projection 5 ans", { views: [{ showGridLines: false }] });
  wsP.columns = [{ width: 30 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];
  title(wsP, 6, "Projection sur 5 ans");
  subtitle(wsP, 6, `Croissance ${s.croissance2}/${s.croissance3}/${s.croissance4}/${s.croissance5} %  ·  ACRE année 1 ${s.acre ? "activée" : "non"}  ·  CFE dès l'année 2`);
  section(wsP, 6, "Compte de résultat prévisionnel");
  header(wsP, ["Indicateur", "Année 1", "Année 2", "Année 3", "Année 4", "Année 5"]);
  const p = projeter5ans(s);
  const P = (label: string, get: (a: typeof p[number]) => number, opts: RowOpts = {}) =>
    dataRow(wsP, label, p.map(get) as number[], opts);
  P("Volume", (a) => Math.round(a.volume * 10) / 10, { fmt: "0.0" });
  P("Chiffre d'affaires", (a) => a.ca, { zebra: true });
  P("Contribution", (a) => a.contribution);
  P("CFE", (a) => -a.cfe, { zebra: true });
  P("Résultat net société", (a) => a.netSoc, { strong: true });
  P("Revenu net dirigeant", (a) => a.revenuDirigeant, { zebra: true });
  P("Trésorerie cumulée", (a) => a.tresoCumulee, { strong: true });

  // ---- Feuille 5 : Hypothèses ----
  const wsH = wb.addWorksheet("Hypothèses", { views: [{ showGridLines: false }] });
  wsH.columns = [{ width: 34 }, { width: 18 }];
  title(wsH, 2, "Hypothèses");
  section(wsH, 2, "Profil & activité");
  header(wsH, ["Paramètre", "Valeur"]);
  const H = (label: string, v: number | string, fmt?: string, zebra = false) => dataRow(wsH, label, [v], { fmt: fmt ?? "raw", zebra });
  H("Dirigeant", dirigeant);
  H("Statut juridique", s.statut, undefined, true);
  H("Nombre d'associés", m.nAssoc, INT);
  H("Modèle d'activité", s.activite === "courtage" ? "Courtage" : "Stock", undefined, true);
  H("Mode d'hypothèses", s.mode === "realiste" ? "Réaliste" : "Prudent");
  H("Volume annuel", s.volume, INT, true);
  if (s.activite === "courtage") H("Commission / mandat", s.commission, EUR);
  else {
    H("Part entrée de gamme (%)", s.mixEg, INT);
    H("Achat / revente entrée de gamme", `${s.achatEg} / ${s.reventeEg} €`, undefined, true);
    H("Achat / revente Crit'Air 2", `${s.achatCa} / ${s.reventeCa} €`);
  }
  section(wsH, 2, "Financement & rémunération");
  header(wsH, ["Paramètre", "Valeur"]);
  H("Capital de départ", s.capital, EUR);
  H("ARCE", s.arce, EUR, true);
  H("Prêt d'honneur", s.pretHonneur, EUR);
  H("Rémunération nette dirigeant", s.remun, EUR, true);
  H("Part du résultat en dividendes (%)", s.distrib, INT);
  H("Croissance volume années 2-5 (%)", `${s.croissance2} / ${s.croissance3} / ${s.croissance4} / ${s.croissance5}`, undefined, true);
  H("Rémunération années 2-5 (€)", `${s.remunA2} / ${s.remunA3} / ${s.remunA4} / ${s.remunA5}`);
  H("ACRE année 1", s.acre ? "Oui" : "Non", undefined, true);

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "simulation-negoce-vo.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
