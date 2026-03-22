import { DashboardLayout } from "@/components/DashboardLayout";
import { Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const services = [
  { name: "API Server", status: "operational", uptime: "99.98%", latency: "45ms" },
  { name: "AI Engine", status: "operational", uptime: "99.95%", latency: "120ms" },
  { name: "Database", status: "operational", uptime: "99.99%", latency: "12ms" },
  { name: "Message Queue", status: "operational", uptime: "99.97%", latency: "8ms" },
  { name: "News Data Feed", status: "degraded", uptime: "98.50%", latency: "350ms" },
  { name: "Social Media Scraper", status: "operational", uptime: "99.90%", latency: "200ms" },
  { name: "Model Training Pipeline", status: "operational", uptime: "99.85%", latency: "N/A" },
  { name: "Backup System", status: "operational", uptime: "100%", latency: "N/A" },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "operational") return <CheckCircle className="w-5 h-5 text-success" />;
  if (status === "degraded") return <AlertTriangle className="w-5 h-5 text-warning" />;
  return <XCircle className="w-5 h-5 text-destructive" />;
};

export default function StatusSistem() {
  const allOp = services.every((s) => s.status === "operational");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Status Sistem</h1>
          <p className="text-muted-foreground text-sm mt-1">Pantau kesehatan semua layanan</p>
        </div>

        <div className={`glass-card p-5 flex items-center gap-3 border-l-4 ${allOp ? "border-l-success" : "border-l-warning"}`}>
          <Activity className={`w-6 h-6 ${allOp ? "text-success" : "text-warning"}`} />
          <div>
            <p className="font-semibold">{allOp ? "Semua Sistem Beroperasi Normal" : "Beberapa Layanan Mengalami Gangguan"}</p>
            <p className="text-sm text-muted-foreground">Terakhir diperbarui: hari ini 14:35 WIB</p>
          </div>
        </div>

        <div className="space-y-2">
          {services.map((s, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-3">
                <StatusIcon status={s.status} />
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{s.status === "operational" ? "Beroperasi normal" : s.status === "degraded" ? "Performa menurun" : "Gangguan"}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="font-medium">{s.uptime}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Latency</p>
                  <p className="font-medium">{s.latency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
