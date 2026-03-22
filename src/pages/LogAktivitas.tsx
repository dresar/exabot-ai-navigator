import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, CheckCircle2, AlertTriangle, XCircle, Info, Clock } from "lucide-react";
import { useState } from "react";

const allLogs = [
  { id: 1, time: "14:32:05", date: "Hari ini", type: "prediksi", event: "Bitcoin > $120k", action: "Posisi YES dipasang secara otomatis", status: "sukses" },
  { id: 2, time: "14:28:12", date: "Hari ini", type: "sistem", event: "-", action: "Model Ensemble v3.2 berhasil diperbarui", status: "sukses" },
  { id: 3, time: "14:15:33", date: "Hari ini", type: "api", event: "-", action: "API Key News dirotasi otomatis ke key backup", status: "sukses" },
  { id: 4, time: "13:55:01", date: "Hari ini", type: "prediksi", event: "Fed Rate Cut Q2", action: "Analisis AI selesai — confidence 89%", status: "sukses" },
  { id: 5, time: "13:42:18", date: "Hari ini", type: "risiko", event: "-", action: "Stop-loss triggered — limit harian Rp 50.000 tercapai", status: "warning" },
  { id: 6, time: "13:30:00", date: "Hari ini", type: "training", event: "-", action: "Training dataset kripto dimulai (28.392 records)", status: "sukses" },
  { id: 7, time: "12:55:44", date: "Hari ini", type: "api", event: "-", action: "Rate limit tercapai — News API (1.000/1.000)", status: "error" },
  { id: 8, time: "12:30:22", date: "Hari ini", type: "prediksi", event: "Tesla $400", action: "Prediksi salah — kalkulasi ulang bobot model", status: "error" },
  { id: 9, time: "12:15:10", date: "Hari ini", type: "sistem", event: "-", action: "Backup database otomatis berhasil", status: "sukses" },
  { id: 10, time: "11:58:33", date: "Hari ini", type: "prediksi", event: "Harga Emas $2.500", action: "Posisi YES dipasang — volume $6.000", status: "sukses" },
  { id: 11, time: "11:30:00", date: "Hari ini", type: "sistem", event: "-", action: "Backtesting 6 bulan selesai — akurasi 78.4%", status: "sukses" },
  { id: 12, time: "10:45:22", date: "Hari ini", type: "prediksi", event: "Fed Rate Cut Q2", action: "Prediksi baru dianalisis AI", status: "sukses" },
];

const typeColors: Record<string, string> = {
  prediksi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  sistem: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  api: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  risiko: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const statusIcon = {
  sukses: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-warning" />,
  error: <XCircle className="w-3.5 h-3.5 text-destructive" />,
};

const types = ["Semua", "prediksi", "sistem", "api", "risiko", "training"];

export default function LogAktivitas() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("Semua");

  const filtered = allLogs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.event.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "Semua" || l.type === activeType;
    return matchSearch && matchType;
  });

  const successCount = allLogs.filter(l => l.status === "sukses").length;
  const errorCount = allLogs.filter(l => l.status === "error").length;
  const warningCount = allLogs.filter(l => l.status === "warning").length;

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Riwayat lengkap semua aktivitas sistem hari ini</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Ekspor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Log", value: `${allLogs.length}`, color: "" },
            { label: "Sukses", value: `${successCount}`, color: "text-success" },
            { label: "Warning", value: `${warningCount}`, color: "text-warning" },
            { label: "Error", value: `${errorCount}`, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari aktivitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border capitalize ${
                  activeType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th className="text-center">Tipe</th>
                  <th>Aktivitas</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id} className="cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="whitespace-nowrap">
                      <div className="font-mono text-xs font-medium">{l.time}</div>
                      <div className="text-[10px] text-muted-foreground">{l.date}</div>
                    </td>
                    <td className="text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${typeColors[l.type] || "bg-secondary text-muted-foreground border-border"}`}>
                        {l.type}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm">{l.action}</span>
                      {l.event !== "-" && (
                        <span className="ml-1.5 text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{l.event}</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {statusIcon[l.status as keyof typeof statusIcon]}
                        <span className={`text-xs font-medium ${l.status === "sukses" ? "text-success" : l.status === "warning" ? "text-warning" : "text-destructive"}`}>
                          {l.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada log yang cocok</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
