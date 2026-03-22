import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Play } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const resultData = [
  { bulan: "Jan", akurasi: 68 }, { bulan: "Feb", akurasi: 72 }, { bulan: "Mar", akurasi: 75 },
  { bulan: "Apr", akurasi: 71 }, { bulan: "Mei", akurasi: 80 }, { bulan: "Jun", akurasi: 83 },
];

export default function BacktestingLab() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setDone(true); }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Backtesting Lab</h1>
          <p className="text-muted-foreground text-sm mt-1">Uji strategi AI pada data historis</p>
        </div>
        <div className="glass-card p-5 flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Rentang Waktu</label>
            <Select defaultValue="6m">
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Bulan</SelectItem>
                <SelectItem value="3m">3 Bulan</SelectItem>
                <SelectItem value="6m">6 Bulan</SelectItem>
                <SelectItem value="1y">1 Tahun</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Model</label>
            <Select defaultValue="ensemble">
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ensemble">Ensemble</SelectItem>
                <SelectItem value="sentiment">Sentimen</SelectItem>
                <SelectItem value="statistical">Statistik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRun} disabled={running} className="gap-2">
            <Play className="w-4 h-4" /> {running ? "Menjalankan..." : "Jalankan Simulasi"}
          </Button>
        </div>

        {done && (
          <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center">
                <p className="text-sm text-muted-foreground">Akurasi</p>
                <p className="text-3xl font-bold text-primary mt-1">78.4%</p>
              </div>
              <div className="glass-card p-5 text-center">
                <p className="text-sm text-muted-foreground">Total Prediksi</p>
                <p className="text-3xl font-bold text-neon-cyan mt-1">342</p>
              </div>
              <div className="glass-card p-5 text-center">
                <p className="text-sm text-muted-foreground">Brier Score</p>
                <p className="text-3xl font-bold text-neon-purple mt-1">0.18</p>
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Grafik Akurasi Bulanan</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={resultData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="akurasi" stroke="hsl(262,83%,58%)" strokeWidth={2} dot={{ fill: "hsl(262,83%,58%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!done && !running && (
          <div className="glass-card p-12 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Pilih parameter dan jalankan simulasi untuk melihat hasil</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
