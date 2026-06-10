import { useEffect, useState } from "react";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSim } from "./simulator-context";
import { listScenarios, saveScenario, deleteScenario, type ScenarioSauve } from "./scenarios-store";

// Plusieurs simulations nommées côte à côte : enregistrer / charger / supprimer.
export function ScenarioManager() {
  const { s, loadAll } = useSim();
  const [list, setList] = useState<ScenarioSauve[]>([]);
  useEffect(() => { setList(listScenarios()); }, []);

  const save = () => {
    const suggestion = `${s.statut} · ${s.volume} ${s.activite === "courtage" ? "mandats" : "véh."}/an`;
    const nom = window.prompt("Nom du scénario à enregistrer :", suggestion);
    if (nom) setList(saveScenario(nom, s));
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FolderOpen className="h-5 w-5" /></span>
            <div>
              <h3 className="font-serif text-base font-semibold">Mes scénarios</h3>
              <p className="text-[11px] text-muted-foreground">Sauvegardez plusieurs simulations et rechargez-les d'un clic.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs shrink-0" onClick={save}>
            <Save className="h-3.5 w-3.5" /> Enregistrer
          </Button>
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Aucun scénario enregistré pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {list.map((sc) => (
              <li key={sc.nom} className="flex items-center gap-2 py-2">
                <button
                  type="button" onClick={() => loadAll(sc.etat)}
                  className="flex-1 min-w-0 text-left rounded-md px-2 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block truncate text-sm font-medium">{sc.nom}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {sc.etat.statut} · {sc.etat.activite === "courtage" ? "courtage" : "stock"} · {sc.etat.volume}/an
                    {sc.etat.dirigeantNom ? ` · ${sc.etat.dirigeantPrenom} ${sc.etat.dirigeantNom}`.trimEnd() : ""}
                  </span>
                </button>
                <Button
                  size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Supprimer ${sc.nom}`} onClick={() => setList(deleteScenario(sc.nom))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
