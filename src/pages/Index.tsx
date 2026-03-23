import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Crosshair, Target, TrendingUp, Brain, Zap, ArrowUpRight, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useExabotWebSocketChannel } from "@/hooks/useExabotWebSocket";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toNum } from "@/lib/format";

type StatsSummary = {
  total_predictions: number;
  resolved_predictions: number;
  win_rate: number;
  avg_ai_probability: number;
  avg_confidence: number;
};

type PerfSeries = {
  date: string;
  ai_accuracy: number | null;
  market_baseline: number | null;
};

type PredictionRow = {
  id: string;
  event_id: string;
  event_name?: string | null;
  category?: string | null;
  ai_probability: string | number;
  market_probability: string | number;
  status: string;
  result: boolean | null;
};

const categoryBadgeColors: Record<string, string> = {
  Politik: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Kripto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Ekonomi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Saham: "bg-green-500/10 text-green-400 border-green-500/20",
  Komoditas: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Teknologi: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Regulasi: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2.5 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Beranda() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useCurrentUser();

  const onWs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["predictions", "recent"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
  }, [qc]);
  useExabotWebSocketChannel("predictions", onWs);

  const summaryQ = useQuery({
    queryKey: ["stats", "summary"],
    queryFn: () => apiFetch<StatsSummary>("/stats/summary"),
    refetchInterval: 60_000,
  });

  const perfQ = useQuery({
    queryKey: ["stats", "performance", "9m"],
    queryFn: () => apiFetch<{ series: PerfSeries[] }>("/stats/performance?period=9m"),
    refetchInterval: 120_000,
  });

  const predictionsQ = useQuery({
    queryKey: ["predictions", "recent"],
    queryFn: () =>
      apiFetch<{ items: PredictionRow[] }>("/predictions?limit=6&page=1"),
    refetchInterval: 30_000,
  });

  const perfData = useMemo(() => {
    const series = perfQ.data?.series ?? [];
    return series.map((s) => ({
      bulan: s.date.length >= 7 ? s.date.slice(5, 10) : s.date,
      ai: toNum(s.ai_accuracy as any),
      market: toNum(s.market_baseline as any),
    }));
  }, [perfQ.data]);

  const weeklyData = useMemo(() => {
    const s = summaryQ.data;
    if (!s || !s.resolved_predictions) {
      return [{ name: "Resolved", menang: 0, kalah: 0 }];
    }
    const wins = Math.round((s.resolved_predictions * s.win_rate) / 100);
    const losses = Math.max(0, s.resolved_predictions - wins);
    return [{ name: "Terselesaikan", menang: wins, kalah: losses }];
  }, [summaryQ.data]);

  const summary = summaryQ.data;
  const avgAiDisplay = summary ? `${summary.avg_ai_probability.toFixed(1)}%` : "—";
  const winRateDisplay = summary ? `${summary.win_rate.toFixed(1)}%` : "—";
  const totalPredDisplay = summary ? String(summary.total_predictions) : "—";
  const confDisplay = summary ? `${summary.avg_confidence.toFixed(1)}%` : "—";

  const greetingName = me?.username ?? "Trader";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Beranda</h1>
              <Badge className="bg-success/15 text-success border-success/25 border text-[10px] px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block mr-1.5 animate-pulse" />
                Sistem Aktif
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selamat datang, <span className="text-foreground font-medium">{greetingName}</span>! Ringkasan performa dari data akun Anda.
            </p>
          </div>
          <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary/90 hover:bg-primary" onClick={() => navigate("/prediksi")}>
            <Zap className="w-3.5 h-3.5" />
            Prediksi Langsung
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
            <StatCard
              title="Rata-rata prob. AI"
              value={summaryQ.isLoading ? "…" : avgAiDisplay}
              change={summary ? `${summary.total_predictions} total prediksi` : "—"}
              changeType="positive"
              icon={Target}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              pulse
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "80ms" }}>
            <StatCard
              title="Win Rate"
              value={summaryQ.isLoading ? "…" : winRateDisplay}
              change="dari prediksi terselesaikan"
              changeType="positive"
              icon={TrendingUp}
              iconBg="bg-cyan-500/10"
              iconColor="text-cyan-500"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "160ms" }}>
            <StatCard
              title="Total Prediksi"
              value={summaryQ.isLoading ? "…" : totalPredDisplay}
              change="semua status"
              changeType="positive"
              icon={Crosshair}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "240ms" }}>
            <StatCard
              title="Confidence Rata-rata"
              value={summaryQ.isLoading ? "…" : confDisplay}
              change="AI prob. rata-rata"
              changeType="negative"
              icon={Brain}
              iconBg="bg-orange-500/10"
              iconColor="text-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 glass-card p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Performa AI (snapshot)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Dari tabel performa harian (akun Anda)</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {perfQ.isFetching ? "Memuat…" : `${perfData.length} titik`}
              </Badge>
            </div>
            {perfData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                Belum ada snapshot performa. Jalankan prediksi / backfill data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262,83%,58%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(262,83%,58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ai" stroke="hsl(217,91%,60%)" fill="url(#blueGrad)" strokeWidth={2} name="AI" dot={false} />
                  <Area type="monotone" dataKey="market" stroke="hsl(262,83%,58%)" fill="url(#purpleGrad)" strokeWidth={2} name="Market" dot={false} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-blue-500 rounded" />
                <span>AI accuracy</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-purple-500 rounded border-dashed" style={{ borderTop: "2px dashed hsl(262,83%,58%)", background: "none" }} />
                <span>Market baseline</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Menang / Kalah</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Agregat prediksi terselesaikan</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="menang" fill="hsl(142,76%,42%)" radius={[3, 3, 0, 0]} name="Menang" maxBarSize={48} />
                <Bar dataKey="kalah" fill="hsl(0,72%,51%)" radius={[3, 3, 0, 0]} name="Kalah" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-cyan-500 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
              <Zap className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold">Insight AI — Ringkasan</h3>
                <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 border text-[10px]">Live + API</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary
                  ? `Akun Anda memiliki ${summary.total_predictions} prediksi dengan ${summary.resolved_predictions} yang sudah terselesaikan dan win rate ${summary.win_rate.toFixed(1)}%. Rata-rata confidence model: ${summary.avg_confidence.toFixed(1)}%. Buka Analisis AI untuk reasoning lengkap per event.`
                  : "Login dan jalankan pipeline prediksi untuk mengisi insight otomatis."}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs shrink-0 hidden sm:flex" onClick={() => navigate("/analisis")}>
              Detail <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div>
              <h3 className="text-sm font-semibold">Prediksi Terbaru</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Hingga 6 entri terakhir (akun Anda)</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate("/log")}>
              Lihat semua <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th className="text-center">Kategori</th>
                  <th className="text-center">AI</th>
                  <th className="text-center">Market</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {predictionsQ.isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      Memuat prediksi…
                    </td>
                  </tr>
                )}
                {predictionsQ.isError && (
                  <tr>
                    <td colSpan={6} className="text-center text-destructive py-8">
                      Gagal memuat prediksi.
                    </td>
                  </tr>
                )}
                {!predictionsQ.isLoading &&
                  (predictionsQ.data?.items ?? []).map((p) => {
                    const cat = p.category ?? "Umum";
                    const eventLabel = p.event_name ?? p.event_id;
                    const ai = toNum(p.ai_probability);
                    const mk = toNum(p.market_probability);
                    const st = p.status === "pending" ? "pending" : "selesai";
                    const hasil =
                      p.result === true ? "benar" : p.result === false ? "salah" : "-";
                    return (
                      <tr key={p.id} className="cursor-pointer transition-colors">
                        <td className="font-medium">{eventLabel}</td>
                        <td className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              categoryBadgeColors[cat] || "bg-secondary/50 text-muted-foreground border-border/50"
                            }`}
                          >
                            {cat}
                          </span>
                        </td>
                        <td className="text-center font-bold text-primary">{ai.toFixed(0)}%</td>
                        <td className="text-center text-muted-foreground">{mk.toFixed(0)}%</td>
                        <td className="text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                              st === "selesai" ? "bg-secondary text-muted-foreground" : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            <Clock className={`w-2.5 h-2.5 ${st === "pending" ? "animate-pulse" : ""}`} />
                            {st}
                          </span>
                        </td>
                        <td className="text-center">
                          {hasil === "benar" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                              <CheckCircle className="w-3.5 h-3.5" /> Benar
                            </span>
                          ) : hasil === "salah" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                              <XCircle className="w-3.5 h-3.5" /> Salah
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MinusCircle className="w-3.5 h-3.5" /> Menunggu
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!predictionsQ.isLoading && (predictionsQ.data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-10">
                      Belum ada prediksi. Kunjungi Data Pasar dan jalankan analisis.
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
