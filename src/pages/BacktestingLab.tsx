import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Play, CheckCircle2, Target, BarChart2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiError } from "@/lib/api";
import { toNum } from "@/lib/format";
import { toast } from "sonner";

type BacktestJob = {
  id: string;
  time_range: string;
  category: string | null;
  status: string;
  accuracy: string | number | null;
  total_predictions: number | null;
  brier_score: string | number | null;
  vs_baseline: string | number | null;
  results: unknown;
  created_at: string;
};

type AiModel = { id: string; name: string; model_type: string };

export default function BacktestingLab() {
  const qc = useQueryClient();
  const [timeRange, setTimeRange] = useState("6m");
  const [modelId, setModelId] = useState<string>("__none__");
  const [category, setCategory] = useState<string>("");

  const modelsQ = useQuery({
    queryKey: ["models"],
    queryFn: () => apiFetch<AiModel[]>("/models"),
  });

  const historyQ = useQuery({
    queryKey: ["backtest", "history"],
    queryFn: () => apiFetch<BacktestJob[]>("/backtest/history"),
    refetchInterval: 15_000,
  });

  const runM = useMutation({
    mutationFn: () =>
      apiFetch<BacktestJob>("/backtest/run", {
        method: "POST",
        body: JSON.stringify({
          time_range: timeRange,
          model_id: modelId === "__none__" ? null : modelId,
          category: category || null,
        }),
      }),
    onSuccess: () => {
      toast.success("Job backtest dimulai");
      qc.invalidateQueries({ queryKey: ["backtest"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  const jobs = historyQ.data ?? [];
  const completedJob = jobs.find((j) => j.status === "completed");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backtesting Lab</h1>
          <p className="text-muted-foreground text-sm mt-0.5">POST /backtest/run · GET /backtest/history</p>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-500" />
            Konfigurasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rentang Waktu</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Bulan</SelectItem>
                  <SelectItem value="3m">3 Bulan</SelectItem>
                  <SelectItem value="6m">6 Bulan</SelectItem>
                  <SelectItem value="1y">1 Tahun</SelectItem>
                  <SelectItem value="2y">2 Tahun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Model (opsional)</label>
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Semua / default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Tanpa filter model</SelectItem>
                  {(modelsQ.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Kategori (opsional)</label>
              <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="Ekonomi">Ekonomi</SelectItem>
                  <SelectItem value="Politik">Politik</SelectItem>
                  <SelectItem value="Kripto">Kripto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => runM.mutate()} disabled={runM.isPending} className="gap-2">
              <Play className="w-4 h-4" />
              {runM.isPending ? "Memulai…" : "Jalankan"}
            </Button>
          </div>
        </div>

        {completedJob && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold">Job selesai (terbaru)</span>
              <Badge variant="secondary" className="text-xs">
                {completedJob.time_range}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Akurasi",
                  value: completedJob.accuracy != null ? `${toNum(completedJob.accuracy).toFixed(1)}%` : "—",
                  icon: Target,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Total prediksi",
                  value: completedJob.total_predictions != null ? String(completedJob.total_predictions) : "—",
                  icon: BarChart2,
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10",
                },
                {
                  label: "Brier",
                  value: completedJob.brier_score != null ? String(toNum(completedJob.brier_score).toFixed(4)) : "—",
                  icon: TrendingUp,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
                {
                  label: "vs Baseline",
                  value: completedJob.vs_baseline != null ? `${toNum(completedJob.vs_baseline).toFixed(1)}%` : "—",
                  icon: CheckCircle2,
                  color: "text-success",
                  bg: "bg-success/10",
                },
              ].map((m) => (
                <div key={m.label} className="glass-card p-4 text-center">
                  <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-2`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            {completedJob.results != null && (
              <div className="glass-card p-4">
                <p className="text-xs font-semibold mb-2">Detail (JSON)</p>
                <pre className="text-[10px] overflow-auto max-h-48 bg-secondary/50 p-3 rounded-lg">
                  {typeof completedJob.results === "string" ? completedJob.results : JSON.stringify(completedJob.results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold">Riwayat job</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table text-sm">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Rentang</th>
                  <th>Status</th>
                  <th className="text-right">Akurasi</th>
                </tr>
              </thead>
              <tbody>
                {historyQ.isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Memuat…
                    </td>
                  </tr>
                )}
                {!historyQ.isLoading &&
                  jobs.map((j) => (
                    <tr key={j.id}>
                      <td className="font-mono text-xs">{j.created_at?.slice(0, 19) ?? "—"}</td>
                      <td>{j.time_range}</td>
                      <td>
                        <Badge variant="secondary">{j.status}</Badge>
                      </td>
                      <td className="text-right">{j.accuracy != null ? `${toNum(j.accuracy).toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                {!historyQ.isLoading && jobs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                      Belum ada job backtest
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
