import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Trophy, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const perfData = [
  { hari: "Sen", saldo: 100000 }, { hari: "Sel", saldo: 102500 },
  { hari: "Rab", saldo: 98000 }, { hari: "Kam", saldo: 105000 },
  { hari: "Jum", saldo: 112000 }, { hari: "Sab", saldo: 109000 },
  { hari: "Min", saldo: 118500 },
];

const history = [
  { event: "Fed Rate Cut", bet: "YES", amount: 5000, result: "menang", profit: 3500 },
  { event: "Bitcoin > $100k", bet: "NO", amount: 3000, result: "menang", profit: 2100 },
  { event: "Tesla Earnings Beat", bet: "YES", amount: 4000, result: "kalah", profit: -4000 },
  { event: "Harga Emas > $2500", bet: "YES", amount: 6000, result: "menang", profit: 4200 },
  { event: "Apple AR Glasses", bet: "NO", amount: 2000, result: "menang", profit: 1400 },
];

export default function Simulasi() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Simulasi (Paper Trading)</h1>
          <p className="text-muted-foreground text-sm mt-1">Latihan prediksi tanpa risiko uang nyata</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Saldo Virtual" value="Rp 118.500" change="+18.5% total" changeType="positive" icon={Wallet} />
          <StatCard title="Total Profit" value="Rp 18.500" change="7 hari terakhir" changeType="positive" icon={TrendingUp} iconColor="text-neon-cyan" />
          <StatCard title="Menang" value="4" change="dari 5 prediksi" changeType="positive" icon={Trophy} iconColor="text-success" />
          <StatCard title="Kalah" value="1" change="dari 5 prediksi" changeType="negative" icon={XCircle} iconColor="text-destructive" />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Performa Saldo Virtual</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hari" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="saldo" stroke="hsl(187,96%,42%)" strokeWidth={2} dot={{ fill: "hsl(187,96%,42%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Histori Prediksi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Event</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Posisi</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Jumlah</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Hasil</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-2 font-medium">{h.event}</td>
                    <td className="text-center py-3 px-2"><Badge variant={h.bet === "YES" ? "default" : "secondary"}>{h.bet}</Badge></td>
                    <td className="text-center py-3 px-2">Rp {h.amount.toLocaleString()}</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={h.result === "menang" ? "default" : "destructive"} className="text-xs">{h.result}</Badge>
                    </td>
                    <td className={`text-center py-3 px-2 font-semibold ${h.profit >= 0 ? "text-success" : "text-destructive"}`}>
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
