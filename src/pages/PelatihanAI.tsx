import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, Clock, Zap, Brain, Database, BarChart2, Cpu, Trash2, Play, Pause } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const perfData = [
  { epoch: "1", akurasi: 52, loss: 0.48 },
  { epoch: "5", akurasi: 61, loss: 0.39 },
  { epoch: "10", akurasi: 68, loss: 0.32 },
  { epoch: "15", akurasi: 74, loss: 0.26 },
  { epoch: "20", akurasi: 78, loss: 0.22 },
  { epoch: "25", akurasi: 82, loss: 0.18 },
  { epoch: "30", akurasi: 85, loss: 0.15 },
  { epoch: "35", akurasi: 87, loss: 0.13 },
];

const trainings = [
  {
    name: "Dataset Politik Q1 2025",
    status: "selesai",
    progress: 100,
    akurasi: "87.3%",
    records: "12.847",
    model: "Ensemble v3.2",
    time: "2 jam 14 menit",
  },
  {
    name: "Dataset Kripto Historis 2020–2024",
    status: "berjalan",
    progress: 67,
    akurasi: "74.1% (sementara)",
    records: "28.392",
    model: "LSTM v2.1",
    time: "Estimasi: 1 jam lagi",
  },
  {
    name: "Dataset Ekonomi Global",
    status: "antrian",
    progress: 0,
    akurasi: "-",
    records: "9.155",
    model: "XGBoost v1.8",
    time: "Belum dimulai",
  },
];

const stats = [
  { label: "Dataset Aktif", value: "3", icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Epoch Selesai", value: "35/50", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Akurasi Terbaik", value: "87.3%", icon: BarChart2, color: "text-success", bg: "bg-success/10" },
  { label: "Sedang Training", value: "1", icon: Brain, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

export default function PelatihanAI() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pusat Pelatihan AI</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Kelola dan pantau proses training model AI secara real-time</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg} shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div
          className={`glass-card p-10 border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
            isDragging ? "border-primary/60 bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-secondary/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? "bg-primary/20" : "bg-secondary"}`}>
            <Upload className={`w-7 h-7 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground/60"}`} />
          </div>
          <p className="font-semibold mb-1">Upload Dataset Baru</p>
          <p className="text-sm text-muted-foreground">Seret file CSV/JSON ke sini, atau klik untuk memilih</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Maksimum 500MB · Format: CSV, JSON, JSONL</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="text-xs">Pilih File</Button>
            <Button variant="outline" size="sm" className="text-xs">Dari URL</Button>
          </div>
        </div>

        {/* Training List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Sesi Training</h3>
          {trainings.map((t, i) => (
            <div key={i} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground">Model: <span className="font-medium text-foreground">{t.model}</span></span>
                        <span className="text-xs text-muted-foreground">{t.records} records</span>
                        <span className="text-xs text-muted-foreground">{t.time}</span>
                      </div>
                    </div>
                    <Badge className={`shrink-0 text-[10px] flex items-center gap-1 ${
                      t.status === "selesai" ? "bg-success/10 text-success border-success/20 border" :
                      t.status === "berjalan" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 border" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {t.status === "selesai" && <CheckCircle2 className="w-3 h-3" />}
                      {t.status === "berjalan" && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                      {t.status === "antrian" && <Clock className="w-3 h-3" />}
                      {t.status}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{t.progress}% · Akurasi: <span className={t.status === "selesai" ? "text-success" : "text-foreground"}>{t.akurasi}</span></span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          t.status === "selesai" ? "bg-success" :
                          t.status === "berjalan" ? "bg-blue-500 animate-pulse" :
                          "bg-muted-foreground/20"
                        }`}
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  {t.status === "berjalan" && (
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                      <Pause className="w-3 h-3" /> Jeda
                    </Button>
                  )}
                  {t.status === "antrian" && (
                    <Button size="sm" className="text-xs gap-1.5 h-8">
                      <Play className="w-3 h-3" /> Mulai
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Curve Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Kurva Peningkatan Performa</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Dataset Politik Q1 2025 — Ensemble v3.2</p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 border text-[10px]">+35% peningkatan</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142,76%,42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142,76%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Epoch", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Akurasi"]} />
              <Area type="monotone" dataKey="akurasi" stroke="hsl(142,76%,42%)" fill="url(#greenGrad)" strokeWidth={2.5} name="Akurasi" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
