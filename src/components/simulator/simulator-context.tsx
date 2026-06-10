import { createContext, useContext, type ReactNode } from "react";
import { useSimulator } from "./use-simulator";

export type Sim = ReturnType<typeof useSimulator>;

const SimulatorContext = createContext<Sim | null>(null);

// Source unique de vérité partagée entre toutes les pages du simulateur.
// useSimulator est instancié une seule fois pour que la mise à jour des hypothèses
// se propage immédiatement aux KPI, à la trésorerie, aux scénarios, etc.
export function SimulatorProvider({ children }: { children: ReactNode }) {
  const sim = useSimulator();
  return <SimulatorContext.Provider value={sim}>{children}</SimulatorContext.Provider>;
}

export function useSim(): Sim {
  const v = useContext(SimulatorContext);
  if (!v) throw new Error("useSim must be used within <SimulatorProvider>");
  return v;
}
