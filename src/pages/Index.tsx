import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Crosshair, Target, TrendingUp, Brain, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

const perfData = [
  { bulan: "Jan", ai: 72, market: 55 }, { bulan: "Feb", ai: 78, market: 60 },
  { bulan: "Mar", ai: 74, market: 58 }, { bulan: "Apr", ai: 82, market: 62 },
  { bulan: "Mei", ai: 85, market: 59 }, { bulan: "Jun", ai: 88, market: 65 },
  { bulan: "Jul", ai: 91, market: 63 }, { bulan: "Agu", ai: 87, market: 67 },
];

const predictions = [
  { id: 1, event: "Pemilu AS 2024 - Pemenang", aiProb: 78, marketProb: 65, status: "selesai", hasil: "benar" },
  { id: 2, event: "Bitcoin > $100k Q1 2025", aiProb: 42, marketProb: 55, status: "pending", hasil: "-" },
  { id: 3, event: "Fed Rate Cut Maret", aiProb: 89, marketProb: 82, status: "selesai", hasil: "benar" },
  { id: 4, event: "Tesla Earnings Beat", aiProb: 61, marketProb: 58, status: "selesai", hasil: "salah" },
  { id: 5, event: "Harga Minyak > $90", aiProb: 35, marketProb: 40, status: "pending", hasil: "-" },
];

export default function Beranda() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Beranda</h1>
          <p className="text-muted-foreground text-sm mt-1">Selamat datang kembali! Berikut ringkasan performa AI kamu.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Akurasi AI" value="87.3%" change="+2.1% dari bulan lalu" changeType="positive" icon={Target} />
          <StatCard title="Win Rate" value="74.8%" change="+5.2% dari bulan lalu" changeType="positive" icon={TrendingUp} iconColor="text-neon-cyan" />
          <StatCard title="Total Prediksi" value="1,247" change="+89 minggu ini" changeType="positive" icon={Crosshair} iconColor="text-neon-purple" />
          <StatCard title="Confidence Rata-rata" value="82.5%" change="-0.3% dari bulan lalu" changeType="negative" icon={Brain} iconColor="text-warning" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Performa AI (Bulanan)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={perfData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="ai" stroke="hsl(217,91%,60%)" fill="url(#blueGrad)" strokeWidth={2} name="AI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">AI vs Market</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={perfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="ai" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} name="AI" />
                <Bar dataKey="market" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} name="Market" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight */}
        <div className="glass-card p-5 border-l-4 border-l-neon-cyan">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <h3 className="text-sm font-semibold">Insight AI</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Model AI menunjukkan peningkatan akurasi sebesar 2.1% bulan ini. Performa terbaik tercatat pada kategori politik dan ekonomi makro. Disarankan untuk meningkatkan bobot pada model sentimen untuk kategori kripto.
          </p>
        </div>

        {/* Recent Predictions Table */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Prediksi Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Event</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">AI</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Market</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{p.event}</td>
                    <td className="text-center py-3 px-2 text-primary font-semibold">{p.aiProb}%</td>
                    <td className="text-center py-3 px-2">{p.marketProb}%</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={p.status === "selesai" ? "default" : "secondary"} className="text-xs">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={p.hasil === "benar" ? "text-success font-medium" : p.hasil === "salah" ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {p.hasil}
                      </span>
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
