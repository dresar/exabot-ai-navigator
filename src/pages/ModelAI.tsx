import { DashboardLayout } from "@/components/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Cpu, Brain, Zap, GitBranch, Plus, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const initialModels = [
  {
    name: "Ensemble v3.2", type: "Multi-Model", akurasi: 87.3, prevAkurasi: 85.1, status: true,
    desc: "Model utama gabungan semua sub-model dengan voting berbobot", latency: "1.2s", color: "text-blue-500", bg: "bg-blue-500/10",
  },
  {
    name: "Sentimen BERT", type: "NLP / Transformer", akurasi: 81.5, prevAkurasi: 79.8, status: true,
    desc: "Analisis sentimen multi-bahasa berbasis arsitektur transformer", latency: "0.8s", color: "text-cyan-500", bg: "bg-cyan-500/10",
  },
  {
    name: "XGBoost Statistical", type: "Machine Learning", akurasi: 79.2, prevAkurasi: 80.1, status: false,
    desc: "Model statistik klasik untuk pola numerik dan korelasi variabel", latency: "0.3s", color: "text-orange-500", bg: "bg-orange-500/10",
  },
  {
    name: "LSTM Temporal", type: "Deep Learning", akurasi: 76.8, prevAkurasi: 74.3, status: true,
    desc: "Analisis pola temporal dan prediksi time-series jangka panjang", latency: "1.5s", color: "text-purple-500", bg: "bg-purple-500/10",
  },
  {
    name: "GPT Reasoning", type: "Large Language Model", akurasi: 84.1, prevAkurasi: 82.5, status: true,
    desc: "Reasoning kompleks berbasis LLM untuk analisis teks mendalam", latency: "2.1s", color: "text-pink-500", bg: "bg-pink-500/10",
  },
];

const barColors = ["hsl(217,91%,60%)", "hsl(187,96%,48%)", "hsl(38,92%,55%)", "hsl(262,83%,65%)", "hsl(330,86%,65%)"];

export default function ModelAI() {
  const [models, setModels] = useState(initialModels);

  const toggleModel = (index: number) => {
    setModels((prev) => prev.map((m, i) => i === index ? { ...m, status: !m.status } : m));
  };

  const compareData = models.map((m, i) => ({
    name: m.name.split(" ")[0],
    akurasi: m.akurasi,
    color: barColors[i],
  }));

  const activeCount = models.filter(m => m.status).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Model AI</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {activeCount} dari {models.length} model aktif · Sistem multi-model
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Tambah Model
          </Button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Model Aktif", value: `${activeCount}`, color: "text-success" },
            { label: "Akurasi Terbaik", value: "87.3%", color: "text-blue-500" },
            { label: "Rata-rata Latency", value: "1.2s", color: "text-purple-500" },
            { label: "Model Tersedia", value: `${models.length}`, color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Model Cards */}
        <div className="space-y-3">
          {models.map((m, i) => {
            const change = m.akurasi - m.prevAkurasi;
            return (
              <div
                key={i}
                className={`glass-card p-5 transition-all duration-200 animate-fade-in ${!m.status ? "opacity-60" : ""}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon + Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl ${m.bg} shrink-0`}>
                      <Cpu className={`w-5 h-5 ${m.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{m.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{m.type}</Badge>
                        {i === 0 && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px]">Principal</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{m.desc}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-muted-foreground">Latency: <span className="font-medium text-foreground">{m.latency}</span></span>
                        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
                          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs sebelumnya
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accuracy + Toggle */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Akurasi</p>
                      <p className={`text-xl font-bold ${m.color}`}>{m.akurasi}%</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={m.status}
                        onCheckedChange={() => toggleModel(i)}
                      />
                      <span className="text-[10px] text-muted-foreground">{m.status ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </div>
                </div>

                {/* Accuracy bar */}
                {m.status && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Performa relatif</span>
                      <span className="font-medium">{m.akurasi}% / 100%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${m.akurasi}%`, background: `hsl(${barColors[i].match(/\d+/g)?.join(",")})` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Perbandingan Performa Model</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compareData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 95]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v}%`, "Akurasi"]}
              />
              <Bar dataKey="akurasi" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {compareData.map((entry, index) => (
                  <Cell key={index} fill={barColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
