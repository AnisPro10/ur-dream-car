import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "checking" | "ok" | "ko";

export function HealthIndicator() {
  const [status, setStatus] = useState<Status>("checking");
  const [detail, setDetail] = useState<string>("Vérification du backend…");

  useEffect(() => {
    const ctrl = new AbortController();
    const t0 = performance.now();
    fetch("/api/public/health", { signal: ctrl.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { status?: string };
        const ms = Math.round(performance.now() - t0);
        if (data.status === "ok") {
          setStatus("ok");
          setDetail(`Backend OK · ${ms} ms`);
        } else {
          setStatus("ko");
          setDetail("Réponse inattendue du backend");
        }
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setStatus("ko");
        setDetail(`Backend injoignable : ${e.message}`);
      });
    return () => ctrl.abort();
  }, []);

  const Icon = status === "checking" ? Loader2 : status === "ok" ? CheckCircle2 : AlertTriangle;
  return (
    <div
      role="status"
      aria-live="polite"
      title={detail}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "checking" && "border-border text-muted-foreground",
        status === "ok" && "border-transparent bg-success/15 text-success",
        status === "ko" && "border-transparent bg-destructive/15 text-destructive",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "checking" && "animate-spin")} />
      <span className="hidden sm:inline">{detail}</span>
      <span className="sm:hidden">{status === "ok" ? "API" : status === "ko" ? "API !" : "API…"}</span>
    </div>
  );
}
