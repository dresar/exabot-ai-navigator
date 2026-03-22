import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Brain, Key, Info, AlertTriangle, CheckCircle2, Zap, Settings, Trash2, X } from "lucide-react";
import { useState } from "react";

const initialNotifs = [
  { id: 1, category: "AI", icon: Brain, title: "Model Ensemble diperbarui ke v3.2", desc: "Akurasi meningkat 2.1% dari versi sebelumnya. Model siap digunakan.", time: "5 menit lalu", read: false, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 2, category: "API", icon: Key, title: "Rate limit News API mendekati batas", desc: "Penggunaan sudah 98% (980/1.000). Rotasi key disarankan segera.", time: "30 menit lalu", read: false, color: "text-destructive", bg: "bg-destructive/10", urgent: true },
  { id: 3, category: "Sistem", icon: Info, title: "Backup database berhasil", desc: "Backup otomatis harian selesai pukul 13:00 WIB. Data aman.", time: "1 jam lalu", read: false, color: "text-success", bg: "bg-success/10" },
  { id: 4, category: "AI", icon: Zap, title: "Prediksi baru tersedia: Fed Rate Cut Q2", desc: "Confidence 89% · Probabilitas YES 82% · Volume $12.1M", time: "2 jam lalu", read: true, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 5, category: "Risiko", icon: AlertTriangle, title: "Stop-loss otomatis aktif", desc: "Limit loss harian Rp 50.000 tercapai. Trading dihentikan hingga reset besok.", time: "3 jam lalu", read: true, color: "text-warning", bg: "bg-warning/10", urgent: true },
  { id: 6, category: "Training", icon: Brain, title: "Training dataset kripto selesai", desc: "74.1% akurasi setelah 67 epoch. Siap di-deploy ke model produksi.", time: "5 jam lalu", read: true, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: 7, category: "Sistem", icon: CheckCircle2, title: "Backtesting 6 bulan selesai", desc: "Akurasi 78.4% · Brier Score 0.18 · 342 prediksi diuji", time: "6 jam lalu", read: true, color: "text-success", bg: "bg-success/10" },
  { id: 8, category: "API", icon: Key, title: "API Key Polymarket dirotasi", desc: "Key lama sudah tidak aktif. Key baru aktif dan berfungsi normal.", time: "8 jam lalu", read: true, color: "text-primary", bg: "bg-primary/10" },
];

const categoryFilters = ["Semua", "AI", "API", "Sistem", "Risiko", "Training"];

const categoryColorMap: Record<string, string> = {
  AI: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  API: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sistem: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Risiko: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function Notifikasi() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = activeFilter === "Semua" ? notifs : notifs.filter(n => n.category === activeFilter);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: number) => setNotifs(prev => prev.filter(n => n.id !== id));

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary/15 text-primary border-primary/25 border text-xs px-2 py-0.5">
                  {unreadCount} baru
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">Semua pembaruan, alert, dan informasi sistem</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={markAllRead}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
              {f !== "Semua" && (
                <span className="ml-1.5 opacity-60">
                  {notifs.filter(n => n.category === f && !n.read).length > 0
                    ? `(${notifs.filter(n => n.category === f && !n.read).length})`
                    : ""}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          {filtered.map((n, idx) => (
            <div
              key={n.id}
              className={`glass-card p-4 flex items-start gap-4 transition-all duration-200 animate-fade-in group ${
                !n.read ? "border-l-4 border-l-primary" : ""
              } ${n.urgent && !n.read ? "border-l-destructive" : ""}`}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => markRead(n.id)}
            >
              <div className={`p-2.5 rounded-xl ${n.bg} shrink-0`}>
                <n.icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-semibold ${!n.read ? "" : "text-muted-foreground"}`}>{n.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColorMap[n.category] || "bg-secondary border-border text-muted-foreground"}`}>
                        {n.category}
                      </span>
                      {n.urgent && !n.read && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 border text-[10px]">Mendesak</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{n.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass-card py-16 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Tidak ada notifikasi</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Semua notifikasi dari kategori ini sudah dibaca atau tidak ada</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
