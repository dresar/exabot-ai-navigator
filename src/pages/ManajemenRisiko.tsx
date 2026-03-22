import { DashboardLayout } from "@/components/DashboardLayout";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, AlertTriangle, TrendingDown, Target, Lock, Bell, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const toggles = [
  { id: "stoploss", label: "Stop-loss Otomatis", desc: "Hentikan trading jika loss melebihi limit harian", on: true, critical: true },
  { id: "notif", label: "Notifikasi Risiko Tinggi", desc: "Kirim alert saat confidence di bawah threshold", on: true, critical: false },
  { id: "conservative", label: "Mode Konservatif", desc: "Hanya eksekusi prediksi dengan confidence > 85%", on: false, critical: false },
  { id: "martingale", label: "Anti-Martingale", desc: "Kurangi ukuran bet setelah kalah berturut-turut", on: true, critical: true },
  { id: "drawdown", label: "Proteksi Drawdown", desc: "Pause otomatis jika drawdown minggu ini > 20%", on: false, critical: true },
  { id: "correlation", label: "Batas Korelasi", desc: "Hindari posisi terlalu mirip pada event berkorelasi", on: true, critical: false },
];

const allocations = [
  { name: "Politik", value: 30, color: "bg-purple-500" },
  { name: "Ekonomi", value: 40, color: "bg-blue-500" },
  { name: "Kripto", value: 15, color: "bg-orange-500" },
  { name: "Saham", value: 10, color: "bg-green-500" },
  { name: "Lainnya", value: 5, color: "bg-gray-400" },
];

export default function ManajemenRisiko() {
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map(t => [t.id, t.on]))
  );

  const toggleItem = (id: string) => {
    setActiveToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const riskLevel = activeToggles.stoploss && activeToggles.martingale ? "Rendah" : activeToggles.notif ? "Sedang" : "Tinggi";
  const riskColor = riskLevel === "Rendah" ? "text-success" : riskLevel === "Sedang" ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Risiko</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Atur batasan, alokasi, dan parameter keamanan sistem</p>
          </div>
          <Badge className={`px-3 py-1.5 text-sm font-semibold ${riskColor === "text-success" ? "bg-success/10 text-success border-success/20" : riskColor === "text-warning" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20"} border`}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Risiko {riskLevel}
          </Badge>
        </div>

        {/* Warning */}
        <div className="glass-card p-4 border-l-4 border-l-warning flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Perhatian Penting</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parameter risiko yang terlalu agresif dapat meningkatkan potensi kerugian signifikan.
              Disarankan untuk memulai dengan mode konservatif jika baru menggunakan sistem.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Limit Risiko */}
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Limit Risiko</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: "Maksimum loss per hari", value: "Rp 50.000", defaultVal: [50], max: 200, step: 10 },
                { label: "Maksimum bet per event", value: "Rp 25.000", defaultVal: [25], max: 100, step: 5 },
                { label: "Confidence minimum (%)", value: "70%", defaultVal: [70], max: 100, step: 5 },
                { label: "Drawdown maksimum", value: "20%", defaultVal: [20], max: 50, step: 5 },
              ].map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                  <Slider defaultValue={item.defaultVal} max={item.max} step={item.step} className="[&>[role=slider]]:h-4 [&>[role=slider]]:w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Alokasi Modal */}
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Target className="w-4 h-4 text-cyan-500" />
              </div>
              <h3 className="font-semibold text-sm">Alokasi Modal per Kategori</h3>
            </div>

            {/* Donut visualization */}
            <div className="flex gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {allocations.reduce((acc, cat, i) => {
                    const offset = acc.offset;
                    const dash = cat.value;
                    acc.elements.push(
                      <circle
                        key={i}
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke={cat.color.replace("bg-", "").replace("-500", "").replace("-400", "")}
                        strokeWidth="4"
                        strokeDasharray={`${dash * 0.88} ${100 * 0.88}`}
                        strokeDashoffset={`${-offset * 0.88}`}
                        className={cat.color.replace("bg-", "stroke-")}
                      />
                    );
                    acc.offset += dash;
                    return acc;
                  }, { offset: 0, elements: [] as React.ReactElement[] }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold">100%</span>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {allocations.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${cat.color} shrink-0`} />
                    <span className="text-muted-foreground flex-1">{cat.name}</span>
                    <span className="font-semibold">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {allocations.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-semibold">{cat.value}%</span>
                  </div>
                  <Slider defaultValue={[cat.value]} max={100} step={5} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Keamanan */}
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <ShieldCheck className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-semibold text-sm">Fitur Keamanan</h3>
          </div>
          <div className="space-y-1">
            {toggles.map((t) => (
              <div key={t.id} className={`flex items-center justify-between py-3 px-3 rounded-xl transition-colors ${activeToggles[t.id] ? "bg-secondary/40" : ""} hover:bg-secondary/30`}>
                <div className="flex items-center gap-3">
                  {t.critical && (
                    <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={activeToggles[t.id]}
                  onCheckedChange={() => toggleItem(t.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" className="text-xs">Reset ke Default</Button>
          <Button size="sm" className="text-xs gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
