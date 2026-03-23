import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Cpu, GitBranch, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toNum } from "@/lib/format";
import { toast } from "sonner";

type AiModel = {
  id: string;
  name: string;
  model_type: string;
  description: string | null;
  version: string;
  accuracy: string | number | null;
  prev_accuracy: string | number | null;
  latency_ms: number | null;
  is_active: boolean;
  weight: string | number;
};

const barColors = ["hsl(217,91%,60%)", "hsl(187,96%,48%)", "hsl(38,92%,55%)", "hsl(262,83%,65%)", "hsl(330,86%,65%)"];

export default function ModelAI() {
  const qc = useQueryClient();
  const modelsQ = useQuery({
    queryKey: ["models"],
    queryFn: () => apiFetch<AiModel[]>("/models"),
  });

  const patchM = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await apiFetch(`/models/${id}`, { method: "PATCH", body: JSON.stringify({ is_active }) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal memperbarui"),
  });

  const models = modelsQ.data ?? [];
  const activeCount = models.filter((m) => m.is_active).length;

  const compareData = models.map((m, i) => ({
    name: m.name.length > 12 ? `${m.name.slice(0, 10)}…` : m.name,
    akurasi: m.accuracy != null ? toNum(m.accuracy) : 0,
    color: barColors[i % barColors.length],
  }));

  const bestAcc = models.reduce((m, x) => {
    const a = x.accuracy != null ? toNum(x.accuracy) : 0;
    return Math.max(m, a);
  }, 0);

  const withLat = models.filter((m) => m.latency_ms != null);
  const avgLat =
    withLat.length > 0 ? withLat.reduce((s, m) => s + (m.latency_ms ?? 0), 0) / withLat.length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Model AI</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {modelsQ.isLoading ? "…" : `${activeCount} dari ${models.length} aktif`} · data dari{" "}
              <code className="text-xs">GET /models</code>
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" variant="secondary" disabled>
            <Plus className="w-3.5 h-3.5" />
            Tambah Model
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Model Aktif", value: String(activeCount), color: "text-success" },
            { label: "Akurasi Terbaik", value: bestAcc > 0 ? `${bestAcc.toFixed(1)}%` : "—", color: "text-blue-500" },
            { label: "Rata-rata Latency", value: avgLat > 0 ? `${avgLat.toFixed(0)} ms` : "—", color: "text-purple-500" },
            { label: "Total", value: String(models.length), color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{modelsQ.isLoading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {modelsQ.isError && <p className="text-sm text-destructive">Gagal memuat model</p>}

        <div className="space-y-3">
          {modelsQ.isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
          {!modelsQ.isLoading &&
            models.map((m, i) => {
              const acc = m.accuracy != null ? toNum(m.accuracy) : null;
              const prev = m.prev_accuracy != null ? toNum(m.prev_accuracy) : null;
              const change = acc != null && prev != null ? acc - prev : 0;
              return (
                <div
                  key={m.id}
                  className={`glass-card p-5 transition-all duration-200 animate-fade-in ${!m.is_active ? "opacity-60" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                        <Cpu className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{m.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {m.model_type}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            v{m.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{m.description ?? "—"}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span>
                            Latency:{" "}
                            <span className="font-medium text-foreground">{m.latency_ms != null ? `${m.latency_ms} ms` : "—"}</span>
                          </span>
                          {acc != null && prev != null && (
                            <span className={`flex items-center gap-0.5 font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
                              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {change >= 0 ? "+" : ""}
                              {change.toFixed(1)}% vs sebelumnya
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Akurasi</p>
                        <p className="text-xl font-bold text-primary">{acc != null ? `${acc.toFixed(1)}%` : "—"}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          checked={m.is_active}
                          disabled={patchM.isPending}
                          onCheckedChange={(on) => patchM.mutate({ id: m.id, is_active: on })}
                        />
                        <span className="text-[10px] text-muted-foreground">{m.is_active ? "Aktif" : "Nonaktif"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!modelsQ.isLoading && models.length === 0 && (
          <div className="glass-card py-14 text-center text-sm text-muted-foreground">Belum ada model AI di database</div>
        )}

        {compareData.length > 0 && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Perbandingan akurasi</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={compareData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Akurasi"]}
                />
                <Bar dataKey="akurasi" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {compareData.map((entry, index) => (
                    <Cell key={entry.name} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
