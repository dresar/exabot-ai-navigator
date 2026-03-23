import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Zap, TrendingUp, TrendingDown, Clock, CheckCircle2, ArrowUpRight, BarChart2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useExabotWebSocketChannel } from "@/hooks/useExabotWebSocket";
import { toNum } from "@/lib/format";

type LivePred = {
  id: string;
  event_id: string;
  event_name?: string | null;
  category?: string | null;
  ai_probability: string | number;
  market_probability: string | number;
  confidence: string | number;
  status: string;
  created_at: string;
};

const categoryColors: Record<string, string> = {
  Kripto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Ekonomi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Saham: "bg-green-500/10 text-green-400 border-green-500/20",
  Teknologi: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Komoditas: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Politik: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Sains: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function PrediksiLangsung() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const qc = useQueryClient();

  const onWs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["predictions", "live"] });
  }, [qc]);
  useExabotWebSocketChannel("predictions", onWs);

  const categoriesQ = useQuery({
    queryKey: ["markets", "categories"],
    queryFn: () => apiFetch<{ items: string[] }>("/markets/categories"),
    staleTime: 120_000,
  });

  const liveQ = useQuery({
    queryKey: ["predictions", "live"],
    queryFn: () => apiFetch<LivePred[]>("/predictions/live"),
    refetchInterval: 15_000,
  });

  const categoryTabs = useMemo(() => {
    const fromApi = categoriesQ.data?.items ?? [];
    const fromLive = new Set<string>();
    for (const p of liveQ.data ?? []) {
      const c = p.category?.trim();
      if (c) fromLive.add(c);
    }
    const merged = new Set<string>([...fromApi, ...fromLive]);
    const sorted = Array.from(merged).sort((a, b) => a.localeCompare(b, "id"));
    return ["Semua", ...sorted];
  }, [categoriesQ.data?.items, liveQ.data]);

  const filtered = useMemo(() => {
    const rows = liveQ.data ?? [];
    if (activeCategory === "Semua") return rows;
    return rows.filter((p) => (p.category ?? "").toLowerCase() === activeCategory.toLowerCase());
  }, [liveQ.data, activeCategory]);

  const handleRefresh = () => liveQ.refetch();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Prediksi Langsung</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold text-success">Live</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} prediksi pending · Polling 15s + WebSocket
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" type="button">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleRefresh} type="button">
              <RefreshCw className={`w-3.5 h-3.5 ${liveQ.isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categoriesQ.isError && (
            <p className="text-xs text-destructive w-full">Gagal memuat kategori pasar — tab menyertakan hanya kategori dari data live.</p>
          )}
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground bg-secondary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {liveQ.isLoading && (
          <p className="text-sm text-muted-foreground">Memuat prediksi live…</p>
        )}
        {liveQ.isError && <p className="text-sm text-destructive">Gagal memuat /predictions/live</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, idx) => {
            const aiProb = toNum(p.ai_probability);
            const marketProb = toNum(p.market_probability);
            const conf = toNum(p.confidence);
            const diff = aiProb - marketProb;
            const signal = diff > 8 ? "positive" : diff < -8 ? "negative" : "neutral";
            const cat = p.category ?? "Umum";
            const title = p.event_name ?? p.event_id;
            let lastUpdate = "—";
            try {
              lastUpdate = formatDistanceToNow(parseISO(p.created_at), { addSuffix: true, locale: idLocale });
            } catch {
              /* ignore */
            }

            return (
              <div
                key={p.id}
                className="glass-card p-5 hover:scale-[1.01] transition-all duration-200 cursor-pointer group space-y-4 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        categoryColors[cat] || "bg-secondary text-muted-foreground border-border"
                      }`}
                    >
                      {cat}
                    </span>
                    <h3 className="font-semibold text-sm leading-snug">{title}</h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] flex items-center gap-1 ${
                      p.status === "pending"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20 border"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {p.status === "pending" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Selesai
                      </>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-primary/8 border border-primary/15 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">EXABOT AI</p>
                    <p className="text-2xl font-bold text-primary leading-none">{aiProb.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">probabilitas YES</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border/50 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">MARKET</p>
                    <p className="text-2xl font-bold leading-none">{marketProb.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">probabilitas YES</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Confidence AI</span>
                    <span
                      className={`font-semibold ${
                        conf >= 85 ? "text-success" : conf >= 70 ? "text-warning" : "text-destructive"
                      }`}
                    >
                      {conf.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        conf >= 85 ? "bg-success" : conf >= 70 ? "bg-warning" : "bg-destructive"
                      }`}
                      style={{ width: `${Math.min(100, conf)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      signal === "positive" ? "text-success" : signal === "negative" ? "text-destructive" : "text-warning"
                    }`}
                  >
                    {signal === "positive" ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        AI lebih optimis ({diff > 0 ? "+" : ""}
                        {diff.toFixed(0)}%)
                      </>
                    ) : signal === "negative" ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5" />
                        AI lebih pesimis ({diff.toFixed(0)}%)
                      </>
                    ) : (
                      <>
                        <BarChart2 className="w-3.5 h-3.5" />
                        Selisih kecil
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {lastUpdate}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground -mt-2">
                  <span>Event ID: {p.event_id.slice(0, 8)}…</span>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Detail <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!liveQ.isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Tidak ada prediksi berstatus <code>pending</code>. Jalankan pipeline analisis dari backend.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
