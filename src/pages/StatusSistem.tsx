import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Activity, CheckCircle2, Server, Database, Zap, Globe, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type ServiceRow = { name: string; status: string; latency_ms?: number; error?: string };

type ServicesPayload = {
  overall: string;
  services: ServiceRow[];
  checked_at: string;
};

function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("redis")) return Zap;
  if (n.includes("database") || n.includes("postgres")) return Database;
  if (n.includes("poly") || n.includes("gamma")) return Globe;
  return Server;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "operational")
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-success">Operasional</span>
      </div>
    );
  if (status === "degraded")
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        <span className="text-xs font-medium text-warning">Terganggu</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-destructive" />
      <span className="text-xs font-medium text-destructive">Down</span>
    </div>
  );
};

export default function StatusSistem() {
  const svcQ = useQuery({
    queryKey: ["status", "services"],
    queryFn: () => apiFetch<ServicesPayload>("/status/services"),
    refetchInterval: 60_000,
  });
  const incQ = useQuery({
    queryKey: ["status", "incidents"],
    queryFn: () => apiFetch<{ items: unknown[]; message?: string }>("/status/incidents"),
  });
  const upQ = useQuery({
    queryKey: ["status", "uptime"],
    queryFn: () => apiFetch<{ uptime_percent_24h?: number; note?: string }>("/status/uptime"),
  });

  const services = svcQ.data?.services ?? [];
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;
  const allOp = degraded === 0 && down === 0 && svcQ.data?.overall === "operational";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Status Sistem</h1>
            <p className="text-muted-foreground text-sm mt-0.5">GET /status/services · cache backend ~30s</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { void svcQ.refetch(); void incQ.refetch(); void upQ.refetch(); }}>
            <RefreshCw className={`w-3.5 h-3.5 ${svcQ.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className={`glass-card p-5 border-l-4 ${allOp ? "border-l-success" : "border-l-warning"} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${allOp ? "bg-success/10" : "bg-warning/10"}`}>
              <Activity className={`w-5 h-5 ${allOp ? "text-success" : "text-warning"}`} />
            </div>
            <div>
              <p className="font-semibold">
                {svcQ.isLoading ? "Memuat…" : allOp ? "Layanan inti OK" : `${degraded + down} layanan bermasalah`}
              </p>
              <p className="text-sm text-muted-foreground">
                {svcQ.data?.checked_at ? `Diperiksa: ${svcQ.data.checked_at}` : "—"}
              </p>
            </div>
          </div>
          <Badge className={`${allOp ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"} border text-xs px-2.5`}>
            {svcQ.data?.overall ?? "—"}
          </Badge>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-1">Ringkasan uptime (backend)</h3>
          {upQ.isLoading && <p className="text-xs text-muted-foreground">Memuat…</p>}
          {!upQ.isLoading && (
            <p className="text-sm text-muted-foreground">
              {upQ.data?.uptime_percent_24h != null ? `${upQ.data.uptime_percent_24h}% (24j)` : "—"}
              {upQ.data?.note && <span className="block mt-1 text-xs">{upQ.data.note}</span>}
            </p>
          )}
        </div>

        {svcQ.isError && <p className="text-sm text-destructive">Gagal memuat status layanan</p>}

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Layanan</h3>
          {svcQ.isLoading && <p className="text-sm text-muted-foreground px-1">Memuat…</p>}
          {!svcQ.isLoading &&
            services.map((s) => {
              const Icon = iconFor(s.name);
              return (
                <div
                  key={s.name}
                  className={`glass-card p-4 flex items-center justify-between ${s.status === "degraded" ? "border-warning/30" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.status === "operational" ? "bg-success/10" : s.status === "degraded" ? "bg-warning/10" : "bg-destructive/10"}`}>
                      <Icon className={`w-4 h-4 ${s.status === "operational" ? "text-success" : s.status === "degraded" ? "text-warning" : "text-destructive"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      {s.error && <p className="text-xs text-destructive">{s.error}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge status={s.status} />
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] text-muted-foreground">Latency</p>
                      <p className="text-xs font-semibold">{s.latency_ms != null ? `${s.latency_ms} ms` : "—"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          {!svcQ.isLoading && services.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">Tidak ada data layanan</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Insiden</h3>
          {incQ.data?.items && Array.isArray(incQ.data.items) && incQ.data.items.length === 0 && (
            <div className="glass-card p-4 text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              {incQ.data.message ?? "Tidak ada insiden aktif"}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
