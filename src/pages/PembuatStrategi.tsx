import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowRight, Zap, Trash2, Copy, Play, Settings, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const initialStrategies = [
  {
    id: 1,
    name: "Strategi High Confidence",
    desc: "Aktif ketika AI sangat yakin, posisi agresif",
    active: true,
    triggered: 47,
    winRate: 89,
    conditions: [
      { if: "Confidence AI > 85%", operator: ">", then: "Pasang posisi YES", color: "text-success" },
      { if: "Selisih AI vs Market > 15%", operator: ">", then: "Tingkatkan ukuran bet 2x", color: "text-primary" },
      { if: "Volume pasar > $5M", operator: ">", then: "Konfirmasi eksekusi", color: "text-cyan-500" },
    ],
  },
  {
    id: 2,
    name: "Strategi Konservatif",
    desc: "Hanya bet pada prediksi paling aman",
    active: false,
    triggered: 23,
    winRate: 95,
    conditions: [
      { if: "Brier Score < 0.15", operator: "<", then: "Aktifkan auto-bet kecil", color: "text-success" },
      { if: "Skor Risiko > 70%", operator: ">", then: "Skip prediksi ini", color: "text-destructive" },
    ],
  },
  {
    id: 3,
    name: "Strategi Momentum",
    desc: "Ikuti tren perubahan probabilitas yang kuat",
    active: true,
    triggered: 31,
    winRate: 81,
    conditions: [
      { if: "Perubahan AI prob > +10% dalam 1 jam", operator: ">", then: "Beli YES secara bertahap", color: "text-primary" },
      { if: "Volume meningkat > 50% dalam 30 menit", operator: ">", then: "Tingkatkan posisi", color: "text-cyan-500" },
    ],
  },
];

export default function PembuatStrategi() {
  const [strategies, setStrategies] = useState(initialStrategies);

  const toggleStrategy = (id: number) => {
    setStrategies((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pembuat Strategi</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Buat aturan otomatis menggunakan logika if-this-then-that</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Strategi Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Strategi", value: `${strategies.length}` },
            { label: "Aktif", value: `${strategies.filter(s => s.active).length}`, color: "text-success" },
            { label: "Total Trigger", value: `${strategies.reduce((s, x) => s + x.triggered, 0)}` },
            { label: "Avg Win Rate", value: `${Math.round(strategies.reduce((s, x) => s + x.winRate, 0) / strategies.length)}%`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.color || ""}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Strategy Cards */}
        <div className="space-y-4">
          {strategies.map((s, idx) => (
            <div
              key={s.id}
              className={`glass-card p-5 space-y-4 animate-fade-in transition-all ${!s.active ? "opacity-60" : ""}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${s.active ? "bg-cyan-500/10" : "bg-secondary"}`}>
                    <Zap className={`w-4 h-4 ${s.active ? "text-cyan-500" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{s.name}</h3>
                      <Badge className={`text-[10px] ${s.active ? "bg-success/10 text-success border-success/20 border" : "bg-secondary text-muted-foreground"}`}>
                        {s.active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">Dipicu: <span className="font-medium text-foreground">{s.triggered}x</span></span>
                      <span className="text-xs font-semibold text-success">Win Rate: {s.winRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Switch checked={s.active} onCheckedChange={() => toggleStrategy(s.id)} />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-2 pl-11">
                {s.conditions.map((c, j) => (
                  <div key={j} className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-secondary/40 border border-border/40">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">JIKA</span>
                    <span className="text-sm font-medium">{c.if}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">MAKA</span>
                    <span className={`text-sm font-semibold ${c.color}`}>{c.then}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Builder */}
        <div className="glass-card p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Tambah Kondisi Baru</h3>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">JIKA</span>
              <Select>
                <SelectTrigger className="w-44 h-9 bg-background border-border/60 text-sm"><SelectValue placeholder="Pilih parameter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">Confidence AI</SelectItem>
                  <SelectItem value="diff">Selisih AI vs Market</SelectItem>
                  <SelectItem value="brier">Brier Score</SelectItem>
                  <SelectItem value="risk">Skor Risiko</SelectItem>
                  <SelectItem value="volume">Volume Pasar</SelectItem>
                  <SelectItem value="change">Perubahan Prob (%)</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-20 h-9 bg-background border-border/60 text-sm"><SelectValue placeholder="Operator" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">&gt; lebih dari</SelectItem>
                  <SelectItem value="lt">&lt; kurang dari</SelectItem>
                  <SelectItem value="eq">= sama dengan</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="text"
                placeholder="Nilai"
                className="w-24 h-9 px-3 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-secondary border border-border text-muted-foreground">MAKA</span>
              <Select>
                <SelectTrigger className="w-52 h-9 bg-background border-border/60 text-sm"><SelectValue placeholder="Pilih aksi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bet-yes">Pasang posisi YES</SelectItem>
                  <SelectItem value="bet-no">Pasang posisi NO</SelectItem>
                  <SelectItem value="skip">Skip prediksi ini</SelectItem>
                  <SelectItem value="alert">Kirim notifikasi</SelectItem>
                  <SelectItem value="increase">Tingkatkan ukuran bet</SelectItem>
                  <SelectItem value="decrease">Kurangi ukuran bet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="text-xs gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Simpan Kondisi
            </Button>
            <Button variant="outline" size="sm" className="text-xs">Batal</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
