import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Bell, Brain, Key, Info, AlertTriangle, CheckCircle } from "lucide-react";

const notifs = [
  { id: 1, category: "AI", icon: Brain, title: "Model Ensemble diperbarui ke v3.2", desc: "Akurasi meningkat 2.1% dari versi sebelumnya", time: "5 menit lalu", read: false },
  { id: 2, category: "API", icon: Key, title: "Rate limit News API tercapai", desc: "Penggunaan sudah 98%. Rotasi key disarankan.", time: "30 menit lalu", read: false },
  { id: 3, category: "Sistem", icon: Info, title: "Backup database berhasil", desc: "Backup otomatis harian telah selesai", time: "1 jam lalu", read: false },
  { id: 4, category: "AI", icon: Brain, title: "Prediksi baru: Fed Rate Cut Q2", desc: "Confidence 89% - Probabilitas YES 82%", time: "2 jam lalu", read: true },
  { id: 5, category: "Risiko", icon: AlertTriangle, title: "Stop-loss triggered", desc: "Limit loss harian tercapai. Trading dihentikan sementara.", time: "3 jam lalu", read: true },
  { id: 6, category: "Sistem", icon: CheckCircle, title: "Training dataset kripto selesai", desc: "Akurasi mencapai 74.1% setelah 67 epoch", time: "5 jam lalu", read: true },
];

export default function Notifikasi() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <p className="text-muted-foreground text-sm mt-1">Semua pembaruan dan alert sistem</p>
          </div>
          <Badge variant="secondary">{notifs.filter(n => !n.read).length} belum dibaca</Badge>
        </div>
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className={`glass-card p-4 flex items-start gap-4 transition-colors ${!n.read ? "border-l-4 border-l-primary" : "opacity-70"}`}>
              <div className="p-2 rounded-lg bg-primary/10 shrink-0"><n.icon className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <Badge variant="outline" className="text-xs">{n.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
