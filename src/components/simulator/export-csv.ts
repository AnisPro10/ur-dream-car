import type { Sim } from "./simulator-context";
import { projeter3ans, num } from "./use-simulator";

// Export des résultats en CSV (séparateur « ; » + BOM UTF-8 → s'ouvre directement
// dans Excel français). Couvre hypothèses, compte de résultat, trésorerie et projection.
function val(n: number) {
  // Nombre FR sans séparateur de milliers (\s couvre l'espace fine insécable) → Excel le lit comme un nombre.
  return num(Math.round(n * 100) / 100, 2).replace(/\s/g, "");
}

export function buildCsv(sim: Sim): string {
  const { s, m } = sim;
  const L: string[] = [];
  const row = (...c: (string | number)[]) => L.push(c.map((x) => (typeof x === "number" ? val(x) : x)).join(";"));

  const dirigeant = `${s.dirigeantPrenom} ${s.dirigeantNom}`.trim() || "—";
  row("Simulateur négoce VO — export");
  row("");
  row("HYPOTHÈSES");
  row("Dirigeant", dirigeant);
  row("Statut", s.statut);
  row("Nombre d'associés", m.nAssoc);
  row("Modèle d'activité", s.activite === "courtage" ? "Courtage" : "Stock");
  row("Mode", s.mode === "realiste" ? "Réaliste" : "Prudent");
  row("Volume annuel", s.volume);
  if (s.activite === "courtage") row("Commission / mandat (€)", s.commission);
  else { row("Part entrée de gamme (%)", s.mixEg); row("Achat / revente EG (€)", `${s.achatEg} / ${s.reventeEg}`); row("Achat / revente Crit'Air 2 (€)", `${s.achatCa} / ${s.reventeCa}`); }
  row("Capital (€)", s.capital);
  row("ARCE (€)", s.arce);
  row("Prêt d'honneur (€)", s.pretHonneur);
  row("Rémunération dirigeant (€/an)", s.remun);
  row("Part en dividendes (%)", s.distrib);
  row("");
  row("COMPTE DE RÉSULTAT (€)");
  row(s.activite === "courtage" ? "Commissions" : "Chiffre d'affaires", m.ca);
  if (!m.courtage) { row("Coût d'achat", -m.achats); row("Marge brute", m.margeBrute); }
  row("TVA sur marge", -m.tvaMarge);
  row("Frais variables", -m.fraisVar);
  row("Contribution", m.contribution);
  row("Charges fixes", -m.chargesFixesAn);
  row("CFE", -s.cfe);
  row("Rémunération dirigeant", -s.remun);
  row("Charges sociales", -m.chargesSoc);
  if (m.cotisMin > 0) row("Cotisations min. (SARL)", -m.cotisMin);
  row("Impôt (IS)", -m.is);
  row("Résultat net société", m.netSoc);
  row("Dividendes nets (total)", m.divNet);
  row("Revenu net dirigeant", m.revenuDirigeant);
  row("");
  row("TRÉSORERIE MENSUELLE (€)");
  row("Mois", "Trésorerie fin de mois");
  row("Départ", m.ressources);
  m.treso.forEach((p) => row(p.mois, p.treso));
  row("Point bas", m.pointBas);
  row("");
  row("PROJECTION 3 ANS (€)");
  row("Indicateur", "Année 1", "Année 2", "Année 3");
  const p = projeter3ans(s);
  row("Volume", p[0].volume, p[1].volume, p[2].volume);
  row("Chiffre d'affaires", p[0].ca, p[1].ca, p[2].ca);
  row("Résultat net société", p[0].netSoc, p[1].netSoc, p[2].netSoc);
  row("Revenu net dirigeant", p[0].revenuDirigeant, p[1].revenuDirigeant, p[2].revenuDirigeant);
  row("Trésorerie cumulée", p[0].tresoCumulee, p[1].tresoCumulee, p[2].tresoCumulee);

  return L.join("\r\n");
}

export function downloadCsv(sim: Sim) {
  if (typeof window === "undefined") return;
  const csv = "﻿" + buildCsv(sim); // BOM pour Excel
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "simulation-negoce-vo.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
