import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Brain, Database, BarChart2, Cpu, Trash2, Play, Pause } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiError } from "@/lib/api";
import { toNum } from "@/lib/format";
import { toast } from "sonner";

type Session = {
  id: string;
  name: string;
  dataset_format: string;
  records_count: number | null;
  status: string;
  progress: number;
  total_epochs: number;
  current_epoch: number;
  current_accuracy: string | number | null;
  final_accuracy: string | number | null;
  error_message: string | null;
  created_at: string;
};

type Epoch = { epoch: number; accuracy: string | number | null; loss: string | number | null; created_at: string };

export default function PelatihanAI() {
  const qc = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const sessionsQ = useQuery({
    queryKey: ["training", "sessions"],
    queryFn: () => apiFetch<Session[]>("/training/sessions"),
    refetchInterval: 10_000,
  });

  const epochsQ = useQuery({
    queryKey: ["training", "epochs", focusId],
    queryFn: () => apiFetch<Epoch[]>(`/training/sessions/${focusId}/epochs`),
    enabled: !!focusId,
  });

  const sessions = sessionsQ.data ?? [];
  const running = sessions.filter((s) => s.status === "running").length;
  const chartData = (epochsQ.data ?? []).map((e) => ({
    epoch: String(e.epoch),
    akurasi: e.accuracy != null ? toNum(e.accuracy) : 0,
  }));

  const startM = useMutation({
    mutationFn: (id: string) => apiFetch(`/training/sessions/${id}/start`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Training dimulai");
      qc.invalidateQueries({ queryKey: ["training"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  const pauseM = useMutation({
    mutationFn: (id: string) => apiFetch(`/training/sessions/${id}/pause`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });

  const cancelM = useMutation({
    mutationFn: (id: string) => apiFetch(`/training/sessions/${id}/cancel`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training"] }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pusat Pelatihan AI</h1>
          <p className="text-muted-foreground text-sm mt-0.5">GET /training/sessions</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Sesi (total)", value: String(sessions.length), icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Sedang Training", value: String(running), icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
            { label: "Akurasi terbaik", value: "—", icon: BarChart2, color: "text-success", bg: "bg-success/10" },
            { label: "Status", value: sessionsQ.isFetching ? "sync…" : "OK", icon: Brain, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg} shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{sessionsQ.isLoading ? "…" : s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`glass-card p-10 border-2 border-dashed text-center transition-all duration-200 ${
            isDragging ? "border-primary/60 bg-primary/5" : "border-border/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        >
          <Upload className={`w-7 h-7 mx-auto mb-2 ${isDragging ? "text-primary" : "text-muted-foreground/60"}`} />
          <p className="font-semibold mb-1">Upload Dataset</p>
          <p className="text-sm text-muted-foreground">Gunakan POST /training/upload dari API atau dokumentasi backend</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Sesi Training</h3>
          {sessionsQ.isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
          {!sessionsQ.isLoading &&
            sessions.map((t, i) => (
              <div key={t.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{t.name}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                          <span>{t.records_count ?? "—"} records</span>
                          <span>{t.dataset_format}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {t.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {t.progress}% · epoch {t.current_epoch}/{t.total_epochs}
                        </span>
                      </div>
                      <Progress value={t.progress} className="h-2" />
                    </div>
                    {t.error_message && <p className="text-xs text-destructive">{t.error_message}</p>}
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setFocusId(t.id)}>
                      Lihat epoch
                    </Button>
                    {t.status === "running" && (
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => pauseM.mutate(t.id)} disabled={pauseM.isPending}>
                        <Pause className="w-3 h-3" /> Jeda
                      </Button>
                    )}
                    {(t.status === "queued" || t.status === "paused") && (
                      <Button size="sm" className="text-xs h-8" onClick={() => startM.mutate(t.id)} disabled={startM.isPending}>
                        <Play className="w-3 h-3" /> Mulai
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-destructive"
                      onClick={() => cancelM.mutate(t.id)}
                      disabled={cancelM.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          {!sessionsQ.isLoading && sessions.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">Belum ada sesi training</p>
          )}
        </div>

        {focusId && chartData.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Kurva akurasi (epoch)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142,76%,42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142,76%,42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Akurasi"]} />
                <Area type="monotone" dataKey="akurasi" stroke="hsl(142,76%,42%)" fill="url(#greenGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {focusId && !epochsQ.isLoading && chartData.length === 0 && (
          <p className="text-xs text-muted-foreground">Belum ada data epoch untuk sesi ini</p>
        )}
      </div>
    </DashboardLayout>
  );
}
