import { DashboardLayout } from "@/components/DashboardLayout";
import { Activity, CheckCircle2, XCircle, AlertTriangle, Clock, Server, Database, Cpu, Zap, Globe, Shield, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const services = [
  { name: "API Server", icon: Server, status: "operational", uptime: "99.98%", latency: "45ms", desc: "REST API endpoint utama", category: "Core" },
  { name: "AI Engine", icon: Cpu, status: "operational", uptime: "99.95%", latency: "120ms", desc: "Multi-model inference server", category: "Core" },
  { name: "Database PostgreSQL", icon: Database, status: "operational", uptime: "99.99%", latency: "12ms", desc: "Database utama & replikasi", category: "Core" },
  { name: "Message Queue", icon: Zap, status: "operational", uptime: "99.97%", latency: "8ms", desc: "Redis queue untuk job async", category: "Core" },
  { name: "News Data Feed", icon: Globe, status: "degraded", uptime: "98.50%", latency: "350ms", desc: "Feed berita eksternal", category: "Data" },
  { name: "Social Media Scraper", icon: Globe, status: "operational", uptime: "99.90%", latency: "200ms", desc: "Twitter/X dan Reddit scraper", category: "Data" },
  { name: "Model Training Pipeline", icon: Cpu, status: "operational", uptime: "99.85%", latency: "N/A", desc: "Distributed training workers", category: "AI" },
  { name: "Backup System", icon: Shield, status: "operational", uptime: "100%", latency: "N/A", desc: "Backup otomatis harian", category: "Infra" },
];

const uptimeHistory = [
  { time: "00:00", uptime: 100 },
  { time: "02:00", uptime: 100 },
  { time: "04:00", uptime: 99.8 },
  { time: "06:00", uptime: 100 },
  { time: "08:00", uptime: 100 },
  { time: "10:00", uptime: 98.5 },
  { time: "12:00", uptime: 100 },
  { time: "14:00", uptime: 99.9 },
  { time: "16:00", uptime: 100 },
];

const incidents = [
  { time: "10:15 WIB", title: "News Data Feed latency tinggi", status: "ongoing", severity: "minor", desc: "Latency meningkat ke 350ms akibat overload server sumber. Sedang ditangani." },
  { time: "04:12 WIB", title: "Database maintenance selesai", status: "resolved", severity: "maintenance", desc: "Maintenance rutin berhasil diselesaikan. Tidak ada data yang hilang." },
];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "operational") return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      <span className="text-xs font-medium text-success">Operasional</span>
    </div>
  );
  if (status === "degraded") return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
      <span className="text-xs font-medium text-warning">Terganggu</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-destructive" />
      <span className="text-xs font-medium text-destructive">Down</span>
    </div>
  );
};

export default function StatusSistem() {
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const downCount = services.filter(s => s.status === "down").length;
  const allOp = degradedCount === 0 && downCount === 0;
  const categories = ["Core", "Data", "AI", "Infra"];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Status Sistem</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Pantau kesehatan dan performa semua layanan ExaBot</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Overall status */}
        <div className={`glass-card p-5 border-l-4 ${allOp ? "border-l-success" : "border-l-warning"} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${allOp ? "bg-success/10" : "bg-warning/10"}`}>
              <Activity className={`w-5 h-5 ${allOp ? "text-success" : "text-warning"}`} />
            </div>
            <div>
              <p className="font-semibold">
                {allOp ? "Semua Sistem Beroperasi Normal" : `${degradedCount} Layanan Mengalami Gangguan`}
              </p>
              <p className="text-sm text-muted-foreground">Terakhir diperbarui: hari ini 14:35 WIB · Auto-refresh 60 detik</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`${allOp ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"} border text-xs px-2.5`}>
              {allOp ? "All Systems Go" : "Partial Outage"}
            </Badge>
          </div>
        </div>

        {/* Uptime chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Uptime 24 Jam Terakhir</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Rata-rata uptime: 99.87%</p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 border text-xs">99.87% Uptime</Badge>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={uptimeHistory} margin={{ top: 4, right: 4, bottom: 0, left: -30 }}>
              <defs>
                <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142,76%,42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142,76%,42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[97, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: any) => [`${v}%`, "Uptime"]} />
              <Area type="monotone" dataKey="uptime" stroke="hsl(142,76%,42%)" fill="url(#uptimeGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Services by category */}
        {categories.map((cat) => {
          const catServices = services.filter(s => s.category === cat);
          if (!catServices.length) return null;
          return (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{cat}</h3>
              <div className="space-y-2">
                {catServices.map((s, i) => (
                  <div
                    key={i}
                    className={`glass-card p-4 flex items-center justify-between transition-all animate-fade-in ${s.status === "degraded" ? "border-warning/30" : ""}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${s.status === "operational" ? "bg-success/10" : s.status === "degraded" ? "bg-warning/10" : "bg-destructive/10"}`}>
                        <s.icon className={`w-4 h-4 ${s.status === "operational" ? "text-success" : s.status === "degraded" ? "text-warning" : "text-destructive"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <StatusBadge status={s.status} />
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">Uptime</p>
                        <p className="text-xs font-semibold">{s.uptime}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] text-muted-foreground">Latency</p>
                        <p className={`text-xs font-semibold ${s.latency !== "N/A" && parseInt(s.latency) > 200 ? "text-warning" : ""}`}>{s.latency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Incidents */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Insiden Hari Ini</h3>
          {incidents.map((inc, i) => (
            <div key={i} className={`glass-card p-4 flex items-start gap-3 ${inc.status === "ongoing" ? "border-l-4 border-l-warning" : "border-l-4 border-l-success"}`}>
              {inc.status === "ongoing"
                ? <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                : <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{inc.title}</p>
                  <Badge className={`text-[10px] ${inc.status === "ongoing" ? "bg-warning/10 text-warning border-warning/20 border" : "bg-success/10 text-success border-success/20 border"}`}>
                    {inc.status === "ongoing" ? "Sedang ditangani" : "Selesai"}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">{inc.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{inc.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock className="w-3 h-3" />
                {inc.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
