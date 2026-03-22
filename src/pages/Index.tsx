import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Crosshair, Target, TrendingUp, Brain, Zap, ArrowUpRight, Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const perfData = [
  { bulan: "Jul", ai: 72, market: 55 },
  { bulan: "Agu", ai: 78, market: 60 },
  { bulan: "Sep", ai: 74, market: 58 },
  { bulan: "Okt", ai: 82, market: 62 },
  { bulan: "Nov", ai: 85, market: 59 },
  { bulan: "Des", ai: 88, market: 65 },
  { bulan: "Jan", ai: 91, market: 63 },
  { bulan: "Feb", ai: 87, market: 67 },
  { bulan: "Mar", ai: 93, market: 70 },
];

const weeklyData = [
  { hari: "Sen", menang: 12, kalah: 3 },
  { hari: "Sel", menang: 8, kalah: 5 },
  { hari: "Rab", menang: 15, kalah: 2 },
  { hari: "Kam", menang: 10, kalah: 4 },
  { hari: "Jum", menang: 18, kalah: 1 },
  { hari: "Sab", menang: 7, kalah: 6 },
  { hari: "Min", menang: 11, kalah: 3 },
];

const predictions = [
  { id: 1, event: "Pemilu AS 2024 - Pemenang", aiProb: 78, marketProb: 65, status: "selesai", hasil: "benar", kategori: "Politik" },
  { id: 2, event: "Bitcoin > $100k Q1 2025", aiProb: 42, marketProb: 55, status: "pending", hasil: "-", kategori: "Kripto" },
  { id: 3, event: "Fed Rate Cut Maret", aiProb: 89, marketProb: 82, status: "selesai", hasil: "benar", kategori: "Ekonomi" },
  { id: 4, event: "Tesla Earnings Beat", aiProb: 61, marketProb: 58, status: "selesai", hasil: "salah", kategori: "Saham" },
  { id: 5, event: "Harga Minyak > $90", aiProb: 35, marketProb: 40, status: "pending", hasil: "-", kategori: "Komoditas" },
  { id: 6, event: "Harga Emas > $2500/oz", aiProb: 88, marketProb: 79, status: "selesai", hasil: "benar", kategori: "Komoditas" },
];

const categoryBadgeColors: Record<string, string> = {
  Politik: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Kripto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Ekonomi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Saham: "bg-green-500/10 text-green-400 border-green-500/20",
  Komoditas: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2.5 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Beranda() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
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
              Selamat pagi, <span className="text-foreground font-medium">Ahmad</span>! Berikut ringkasan performa AI kamu hari ini.
            </p>
          </div>
          <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary/90 hover:bg-primary" onClick={() => navigate("/prediksi")}>
            <Zap className="w-3.5 h-3.5" />
            Prediksi Langsung
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
            <StatCard
              title="Akurasi AI"
              value="87.3%"
              change="+2.1% dari bulan lalu"
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
              value="74.8%"
              change="+5.2% dari bulan lalu"
              changeType="positive"
              icon={TrendingUp}
              iconBg="bg-cyan-500/10"
              iconColor="text-cyan-500"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "160ms" }}>
            <StatCard
              title="Total Prediksi"
              value="1.247"
              change="+89 minggu ini"
              changeType="positive"
              icon={Crosshair}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "240ms" }}>
            <StatCard
              title="Confidence Rata-rata"
              value="82.5%"
              change="-0.3% dari bulan lalu"
              changeType="negative"
              icon={Brain}
              iconBg="bg-orange-500/10"
              iconColor="text-orange-500"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Area Chart - spans 3 */}
          <div className="lg:col-span-3 glass-card p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Performa AI (9 Bulan)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Akurasi prediksi vs benchmark pasar</p>
              </div>
              <Badge variant="secondary" className="text-xs">Bulanan</Badge>
            </div>
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
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[40, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ai" stroke="hsl(217,91%,60%)" fill="url(#blueGrad)" strokeWidth={2} name="AI" dot={false} />
                <Area type="monotone" dataKey="market" stroke="hsl(262,83%,58%)" fill="url(#purpleGrad)" strokeWidth={2} name="Market" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-blue-500 rounded" />
                <span>ExaBot AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-purple-500 rounded border-dashed" style={{ borderTop: "2px dashed hsl(262,83%,58%)", background: "none" }} />
                <span>Market Baseline</span>
              </div>
            </div>
          </div>

          {/* Win/Loss Bar - spans 2 */}
          <div className="lg:col-span-2 glass-card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Menang / Kalah</h3>
                <p className="text-xs text-muted-foreground mt-0.5">7 hari terakhir</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="menang" fill="hsl(142,76%,42%)" radius={[3, 3, 0, 0]} name="Menang" maxBarSize={24} />
                <Bar dataKey="kalah" fill="hsl(0,72%,51%)" radius={[3, 3, 0, 0]} name="Kalah" maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight */}
        <div className="glass-card p-5 border-l-4 border-l-cyan-500 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
              <Zap className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold">Insight AI — Hari Ini</h3>
                <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 border text-[10px]">Diperbarui 2 menit lalu</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Model AI menunjukkan peningkatan akurasi sebesar 2.1% bulan ini. Performa terbaik tercatat pada kategori <span className="text-foreground font-medium">politik</span> dan <span className="text-foreground font-medium">ekonomi makro</span> dengan confidence rata-rata di atas 85%.
                Disarankan untuk meningkatkan bobot pada model sentimen untuk kategori kripto — volatilitas tinggi menyebabkan prediksi kurang optimal.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs shrink-0 hidden sm:flex" onClick={() => navigate("/analisis")}>
              Detail <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Recent Predictions Table */}
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div>
              <h3 className="text-sm font-semibold">Prediksi Terbaru</h3>
              <p className="text-xs text-muted-foreground mt-0.5">6 prediksi terakhir dari semua kategori</p>
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
                {predictions.map((p) => (
                  <tr key={p.id} className="cursor-pointer transition-colors">
                    <td className="font-medium">{p.event}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryBadgeColors[p.kategori] || ""}`}>
                        {p.kategori}
                      </span>
                    </td>
                    <td className="text-center font-bold text-primary">{p.aiProb}%</td>
                    <td className="text-center text-muted-foreground">{p.marketProb}%</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.status === "selesai"
                          ? "bg-secondary text-muted-foreground"
                          : "bg-blue-500/10 text-blue-400"
                      }`}>
                        <Clock className={`w-2.5 h-2.5 ${p.status === "pending" ? "animate-pulse" : ""}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {p.hasil === "benar" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                          <CheckCircle className="w-3.5 h-3.5" /> Benar
                        </span>
                      ) : p.hasil === "salah" ? (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
