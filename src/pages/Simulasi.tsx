import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Trophy, XCircle, Plus, RefreshCw, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const perfData = [
  { hari: "Sen", saldo: 100000 },
  { hari: "Sel", saldo: 102500 },
  { hari: "Rab", saldo: 98000 },
  { hari: "Kam", saldo: 105000 },
  { hari: "Jum", saldo: 112000 },
  { hari: "Sab", saldo: 109000 },
  { hari: "Min", saldo: 118500 },
];

const history = [
  { id: 1, event: "Fed Rate Cut Q2 2025", bet: "YES", amount: 5000, aiProb: 82, result: "menang", profit: 3500, date: "20 Mar" },
  { id: 2, event: "Bitcoin > $100k", bet: "NO", amount: 3000, aiProb: 34, result: "menang", profit: 2100, date: "19 Mar" },
  { id: 3, event: "Tesla Earnings Beat", bet: "YES", amount: 4000, aiProb: 61, result: "kalah", profit: -4000, date: "18 Mar" },
  { id: 4, event: "Harga Emas > $2.500", bet: "YES", amount: 6000, aiProb: 88, result: "menang", profit: 4200, date: "17 Mar" },
  { id: 5, event: "Apple AR Glasses 2025", bet: "NO", amount: 2000, aiProb: 55, result: "menang", profit: 1400, date: "15 Mar" },
];

const winRate = 80;

export default function Simulasi() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simulasi (Paper Trading)</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Latihan prediksi tanpa risiko uang nyata</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Prediksi Baru
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Saldo Virtual" value="Rp 118.500" change="+18.5% total" changeType="positive" icon={Wallet} iconBg="bg-blue-500/10" iconColor="text-blue-500" pulse />
          <StatCard title="Total Profit" value="Rp 18.500" change="7 hari terakhir" changeType="positive" icon={TrendingUp} iconBg="bg-cyan-500/10" iconColor="text-cyan-500" />
          <StatCard title="Menang" value="4" change="dari 5 prediksi" changeType="positive" icon={Trophy} iconBg="bg-success/10" iconColor="text-success" />
          <StatCard title="Kalah" value="1" change="dari 5 prediksi" changeType="negative" icon={XCircle} iconBg="bg-destructive/10" iconColor="text-destructive" />
        </div>

        {/* Win Rate & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Win Rate Card */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Statistik Performa</h3>

            <div className="text-center py-2">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="hsl(142,76%,42%)" strokeWidth="3"
                    strokeDasharray={`${winRate} ${100 - winRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-success">{winRate}%</span>
                  <span className="text-[10px] text-muted-foreground">Win Rate</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { label: "Prediksi Total", value: "5" },
                { label: "Total Menang", value: "4" },
                { label: "Total Kalah", value: "1" },
                { label: "Profit Bersih", value: "Rp 7.200" },
                { label: "ROI", value: "+7.2%" },
                { label: "Avg. AI Confidence", value: "82%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Performa Saldo Virtual</h3>
                <p className="text-xs text-muted-foreground mt-0.5">7 hari terakhir</p>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 border text-[10px]">
                <ArrowUpRight className="w-3 h-3 mr-1" />+18.5%
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(187,96%,48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(187,96%,48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`Rp ${v.toLocaleString()}`, "Saldo"]}
                />
                <Area type="monotone" dataKey="saldo" stroke="hsl(187,96%,48%)" fill="url(#cyanGrad)" strokeWidth={2.5} dot={false} name="Saldo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold">Histori Prediksi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th className="text-center">Tanggal</th>
                  <th className="text-center">Posisi</th>
                  <th className="text-center">Jumlah</th>
                  <th className="text-center">AI Prob</th>
                  <th className="text-center">Hasil</th>
                  <th className="text-center">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="cursor-pointer transition-colors">
                    <td className="font-medium">{h.event}</td>
                    <td className="text-center text-muted-foreground">{h.date}</td>
                    <td className="text-center">
                      <Badge className={`text-[10px] ${h.bet === "YES" ? "bg-success/10 text-success border-success/20 border" : "bg-destructive/10 text-destructive border-destructive/20 border"}`}>
                        {h.bet}
                      </Badge>
                    </td>
                    <td className="text-center text-sm">Rp {h.amount.toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`text-xs font-bold ${h.aiProb >= 75 ? "text-success" : h.aiProb >= 55 ? "text-warning" : "text-destructive"}`}>
                        {h.aiProb}%
                      </span>
                    </td>
                    <td className="text-center">
                      <Badge className={`text-[10px] ${h.result === "menang" ? "bg-success/10 text-success border-success/20 border" : "bg-destructive/10 text-destructive border-destructive/20 border"}`}>
                        {h.result}
                      </Badge>
                    </td>
                    <td className={`text-center font-bold text-sm ${h.profit >= 0 ? "text-success" : "text-destructive"}`}>
                      {h.profit >= 0 ? "+" : ""}Rp {Math.abs(h.profit).toLocaleString()}
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
