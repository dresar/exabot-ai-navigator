import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Play, CheckCircle2, TrendingUp, Target, BarChart2, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const resultData = [
  { bulan: "Jan", akurasi: 68, baseline: 55 },
  { bulan: "Feb", akurasi: 72, baseline: 57 },
  { bulan: "Mar", akurasi: 75, baseline: 59 },
  { bulan: "Apr", akurasi: 71, baseline: 56 },
  { bulan: "Mei", akurasi: 80, baseline: 60 },
  { bulan: "Jun", akurasi: 83, baseline: 61 },
];

const categoryResults = [
  { name: "Ekonomi", akurasi: 89, prediksi: 87, brier: 0.12 },
  { name: "Politik", akurasi: 84, prediksi: 102, brier: 0.15 },
  { name: "Kripto", akurasi: 71, prediksi: 58, brier: 0.22 },
  { name: "Saham", akurasi: 78, prediksi: 95, brier: 0.18 },
];

export default function BacktestingLab() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRange, setTimeRange] = useState("6m");
  const [model, setModel] = useState("ensemble");

  const handleRun = () => {
    setRunning(true);
    setDone(false);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          setDone(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleReset = () => {
    setDone(false);
    setProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Backtesting Lab</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Uji performa model AI pada data historis untuk validasi strategi</p>
        </div>

        {/* Config Panel */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-500" />
            Konfigurasi Simulasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rentang Waktu</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
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
              <label className="text-xs font-medium text-muted-foreground">Model AI</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensemble">Ensemble v3.2</SelectItem>
                  <SelectItem value="sentiment">Sentimen BERT</SelectItem>
                  <SelectItem value="statistical">XGBoost</SelectItem>
                  <SelectItem value="lstm">LSTM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Kategori</label>
              <Select defaultValue="semua">
                <SelectTrigger className="h-9 bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  <SelectItem value="ekonomi">Ekonomi</SelectItem>
                  <SelectItem value="politik">Politik</SelectItem>
                  <SelectItem value="kripto">Kripto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {done && (
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              )}
              <Button onClick={handleRun} disabled={running} className="gap-2 flex-1">
                <Play className="w-4 h-4" />
                {running ? "Memproses..." : "Jalankan"}
              </Button>
            </div>
          </div>

          {running && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Memproses {progress < 30 ? "data historis" : progress < 60 ? "prediksi model" : progress < 90 ? "evaluasi hasil" : "finalisasi"}...</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Results */}
        {done && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">Simulasi Selesai</span>
                <Badge variant="secondary" className="text-xs">
                  {timeRange === "1m" ? "1 Bulan" : timeRange === "3m" ? "3 Bulan" : timeRange === "6m" ? "6 Bulan" : "1 Tahun"} · {model === "ensemble" ? "Ensemble v3.2" : model}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                Ekspor Hasil
              </Button>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Akurasi", value: "78.4%", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Total Prediksi", value: "342", icon: BarChart2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                { label: "Brier Score", value: "0.18", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "vs Baseline", value: "+23.4%", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
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

            {/* Chart */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Grafik Akurasi vs Baseline</h3>
                <Badge variant="secondary" className="text-xs">Bulanan</Badge>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={resultData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="purpleGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262,83%,65%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262,83%,65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[40, 90]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" label={{ value: "Target", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Area type="monotone" dataKey="akurasi" stroke="hsl(262,83%,65%)" fill="url(#purpleGrad2)" strokeWidth={2.5} name="Akurasi AI" dot={false} />
                  <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="none" strokeWidth={1.5} name="Baseline" strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Per-category breakdown */}
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50">
                <h3 className="text-sm font-semibold">Hasil per Kategori</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th className="text-center">Prediksi</th>
                      <th className="text-center">Akurasi</th>
                      <th className="text-center">Brier Score</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryResults.map((r) => (
                      <tr key={r.name}>
                        <td className="font-medium">{r.name}</td>
                        <td className="text-center text-muted-foreground">{r.prediksi}</td>
                        <td className="text-center">
                          <span className={`font-bold ${r.akurasi >= 80 ? "text-success" : r.akurasi >= 70 ? "text-warning" : "text-destructive"}`}>
                            {r.akurasi}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`font-semibold ${r.brier <= 0.15 ? "text-success" : r.brier <= 0.20 ? "text-warning" : "text-destructive"}`}>
                            {r.brier}
                          </span>
                        </td>
                        <td className="text-center">
                          <Badge className={`text-[10px] ${r.akurasi >= 80 ? "bg-success/10 text-success border-success/20 border" : r.akurasi >= 70 ? "bg-warning/10 text-warning border-warning/20 border" : "bg-destructive/10 text-destructive border-destructive/20 border"}`}>
                            {r.akurasi >= 80 ? "Sangat Baik" : r.akurasi >= 70 ? "Baik" : "Perlu Ditingkatkan"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!done && !running && (
          <div className="glass-card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-muted-foreground">Belum ada hasil simulasi</p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm mx-auto">
              Pilih rentang waktu dan model AI, lalu klik "Jalankan" untuk melihat hasil backtesting
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
