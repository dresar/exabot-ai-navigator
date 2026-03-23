import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Brain, AlertTriangle, CheckCircle, Sparkles, BarChart2, Globe, TrendingUp } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { useExabotWebSocketChannel } from "@/hooks/useExabotWebSocket";
import { toNum } from "@/lib/format";

type MarketRow = { id: string; name: string; category: string; yes_price: string | number };
type AnalysisResp = {
  event_id: string;
  event_name: string;
  prediction: null | {
    ai_probability: number;
    market_probability: number;
    confidence: number;
    ai_edge: number | null;
    reasoning: string | null;
    sentiment_data: Record<string, number> | null;
    factor_scores: Record<string, number> | null;
    created_at: string | null;
  };
};
type NewsRow = {
  id: string;
  source: string;
  title: string;
  sentiment: string | null;
  sentiment_score: number | null;
  published_at: string | null;
};

const COLORS = ["hsl(142,76%,42%)", "hsl(0,72%,51%)", "hsl(38,92%,55%)"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function AnalisisAI() {
  const qc = useQueryClient();
  const [eventId, setEventId] = useState<string | null>(null);

  const onWs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["analysis"] });
    qc.invalidateQueries({ queryKey: ["markets", "analisis"] });
  }, [qc]);
  useExabotWebSocketChannel("predictions", onWs);

  const marketsQ = useQuery({
    queryKey: ["markets", "analisis"],
    queryFn: () => apiFetch<{ items: MarketRow[] }>("/markets?limit=12&page=1&sort_by=volume_usd&order=desc"),
  });

  useEffect(() => {
    const first = marketsQ.data?.items?.[0]?.id;
    if (first && !eventId) setEventId(first);
  }, [marketsQ.data, eventId]);

  const analysisQ = useQuery({
    queryKey: ["analysis", eventId],
    queryFn: () => apiFetch<AnalysisResp>(`/analysis/${eventId}`),
    enabled: !!eventId,
  });

  const newsQ = useQuery({
    queryKey: ["analysis", eventId, "news"],
    queryFn: () => apiFetch<NewsRow[]>(`/analysis/${eventId}/news`),
    enabled: !!eventId,
  });

  const sentimentData = useMemo(() => {
    const raw = analysisQ.data?.prediction?.sentiment_data;
    if (!raw || typeof raw !== "object") {
      return [
        { name: "Positif", value: 0 },
        { name: "Negatif", value: 0 },
        { name: "Netral", value: 100 },
      ];
    }
    const entries = Object.entries(raw);
    const sum = entries.reduce((s, [, v]) => s + toNum(v as any), 0) || 1;
    return entries.map(([name, v]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round((toNum(v as any) / sum) * 100),
    }));
  }, [analysisQ.data]);

  const factorData = useMemo(() => {
    const raw = analysisQ.data?.prediction?.factor_scores;
    if (!raw || typeof raw !== "object") {
      return [{ faktor: "Data", skor: 0 }];
    }
    return Object.entries(raw).map(([k, v]) => ({
      faktor: k.replace(/_/g, " "),
      skor: Math.round(toNum(v as any)),
    }));
  }, [analysisQ.data]);

  const events = marketsQ.data?.items ?? [];

  const pred = analysisQ.data?.prediction;
  const eventName = analysisQ.data?.event_name ?? eventId ?? "";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisis AI</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Reasoning dan faktor dari pipeline backend</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {events.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEventId(e.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                eventId === e.id
                  ? "bg-primary/10 text-primary border-primary/30 neon-glow"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="truncate max-w-[200px]">{e.name}</span>
              <span className={`text-xs font-bold ${eventId === e.id ? "text-primary" : "text-muted-foreground"}`}>
                {(toNum(e.yes_price) * 100).toFixed(0)}¢
              </span>
            </button>
          ))}
        </div>

        {marketsQ.isLoading && <p className="text-sm text-muted-foreground">Memuat event pasar…</p>}
        {!marketsQ.isLoading && events.length === 0 && (
          <p className="text-sm text-destructive">Belum ada data pasar. Jalankan ingestion di backend.</p>
        )}

        <div className="glass-card p-5 border-l-4 border-l-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex items-start gap-3 relative">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-sm">Reasoning AI — {eventName}</h3>
                {pred && (
                  <>
                    <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px]">
                      Probabilitas: {pred.ai_probability?.toFixed?.(1) ?? pred.ai_probability}%
                    </Badge>
                    <Badge className="bg-success/10 text-success border-success/20 border text-[10px]">
                      <TrendingUp className="w-2.5 h-2.5 mr-1" />
                      Confidence {pred.confidence?.toFixed?.(1) ?? pred.confidence}%
                    </Badge>
                  </>
                )}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {analysisQ.isLoading && <p>Memuat analisis…</p>}
                {analysisQ.isError && <p>Gagal memuat /analysis/{eventId}</p>}
                {pred?.reasoning ? (
                  <p className="whitespace-pre-wrap">{pred.reasoning}</p>
                ) : (
                  !analysisQ.isLoading && (
                    <p>
                      Belum ada prediksi untuk event ini. Gunakan{" "}
                      <code className="text-xs bg-secondary px-1 rounded">POST /predictions/analyze</code> dari API atau UI terkait.
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-semibold">Analisis Sentimen</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {sentimentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {sentimentData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[sentimentData.indexOf(s) % COLORS.length] }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold">Skor Faktor Analisis</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={factorData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="faktor"
                  type="category"
                  width={115}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="skor" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {factorData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.skor >= 80 ? "hsl(187,96%,48%)" : entry.skor >= 65 ? "hsl(217,91%,60%)" : "hsl(262,83%,65%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-success/10">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-semibold">Faktor / model</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Detail faktor pendukung diperoleh dari pipeline AI (lihat reasoning di atas dan skor faktor).
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-sm font-semibold">Risiko</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Selalu verifikasi dengan data pasar terbaru. Edge AI: {pred?.ai_edge != null ? `${toNum(pred.ai_edge as any).toFixed(1)}` : "—"}.
            </p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sumber Berita Relevan</h3>
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {(newsQ.data ?? []).length} artikel
            </Badge>
          </div>
          <div className="divide-y divide-border/30">
            {newsQ.isLoading && <div className="px-5 py-6 text-sm text-muted-foreground">Memuat berita…</div>}
            {(newsQ.data ?? []).map((news) => {
              const sent = (news.sentiment ?? "netral").toLowerCase();
              const score = news.sentiment_score != null ? toNum(news.sentiment_score) : 0;
              return (
                <div key={news.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
                  <div
                    className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      sent === "positif" || sent === "positive"
                        ? "bg-success/10 text-success"
                        : sent === "negatif" || sent === "negative"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {news.source}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-medium ${
                          sent === "positif" || sent === "positive"
                            ? "text-success"
                            : sent === "negatif" || sent === "negative"
                              ? "text-destructive"
                              : "text-warning"
                        }`}
                      >
                        {sent} ({score.toFixed(2)})
                      </span>
                      <span className="text-xs text-muted-foreground">· {news.published_at ?? ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!newsQ.isLoading && (newsQ.data ?? []).length === 0 && (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">Tidak ada artikel untuk event ini.</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
