import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

const logs = [
  { time: "14:32:05", type: "prediksi", event: "Bitcoin > $120k", action: "Posisi YES dipasang", status: "sukses" },
  { time: "14:28:12", type: "sistem", event: "-", action: "Model Ensemble v3.2 diperbarui", status: "sukses" },
  { time: "14:15:33", type: "api", event: "-", action: "API Key News rotasi otomatis", status: "sukses" },
  { time: "13:55:01", type: "prediksi", event: "Fed Rate Cut", action: "Analisis selesai - confidence 89%", status: "sukses" },
  { time: "13:42:18", type: "risiko", event: "-", action: "Stop-loss triggered - limit harian tercapai", status: "warning" },
  { time: "13:30:00", type: "training", event: "-", action: "Training dataset kripto dimulai", status: "sukses" },
  { time: "12:55:44", type: "api", event: "-", action: "Rate limit tercapai - News API", status: "error" },
  { time: "12:30:22", type: "prediksi", event: "Tesla $400", action: "Prediksi salah - evaluasi model", status: "error" },
  { time: "12:15:10", type: "sistem", event: "-", action: "Backup database otomatis", status: "sukses" },
  { time: "11:58:33", type: "prediksi", event: "Harga Emas $2500", action: "Posisi YES dipasang", status: "sukses" },
];

export default function LogAktivitas() {
  const [search, setSearch] = useState("");
  const filtered = logs.filter((l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.event.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Log Aktivitas</h1>
          <p className="text-muted-foreground text-sm mt-1">Riwayat lengkap semua aktivitas sistem</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari aktivitas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Waktu</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tipe</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aktivitas</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{l.time}</td>
                    <td className="text-center py-3 px-4"><Badge variant="outline" className="text-xs">{l.type}</Badge></td>
                    <td className="py-3 px-4">{l.action}{l.event !== "-" && <span className="text-muted-foreground"> — {l.event}</span>}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={l.status === "sukses" ? "default" : l.status === "warning" ? "secondary" : "destructive"} className="text-xs">{l.status}</Badge>
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
