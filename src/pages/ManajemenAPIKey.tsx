import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, RotateCcw, Copy, Eye, EyeOff, Trash2, Shield, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";

const initialKeys = [
  {
    id: 1, name: "Polymarket API", key: "pk_live_a7f3b2c9d1e4f8g5h2i6j3k9l0m4n7p1q8r5", masked: "pk_live_****7f3a",
    status: "aktif", usage: 72, limit: "10.000/hari", used: 7200, category: "Pasar",
    lastUsed: "2 menit lalu", rotateAt: "90%",
  },
  {
    id: 2, name: "OpenAI GPT-4", key: "sk-proj-xyz123abc456def789ghi012jkl345mno678pqr",
    masked: "sk-****9x2b", status: "aktif", usage: 45, limit: "5.000/hari", used: 2250, category: "AI",
    lastUsed: "5 menit lalu", rotateAt: "85%",
  },
  {
    id: 3, name: "News API", key: "na_8k1m2n3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e", masked: "na_****4k1m",
    status: "limit", usage: 98, limit: "1.000/hari", used: 980, category: "Data",
    lastUsed: "30 menit lalu", rotateAt: "90%",
  },
  {
    id: 4, name: "Twitter/X API", key: "tw_v2_9p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0",
    masked: "tw_****8p3q", status: "aktif", usage: 23, limit: "15.000/hari", used: 3450, category: "Sosial",
    lastUsed: "1 jam lalu", rotateAt: "90%",
  },
  {
    id: 5, name: "CoinGecko API", key: "cg_pro_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s",
    masked: "cg_****2r9s", status: "aktif", usage: 11, limit: "30.000/hari", used: 3300, category: "Kripto",
    lastUsed: "15 menit lalu", rotateAt: "85%",
  },
];

const categoryColors: Record<string, string> = {
  Pasar: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  AI: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Data: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sosial: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Kripto: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function ManajemenAPIKey() {
  const [visibleKeys, setVisibleKeys] = useState<number[]>([]);
  const [rotating, setRotating] = useState<number[]>([]);

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRotate = (id: number) => {
    setRotating((prev) => [...prev, id]);
    setTimeout(() => setRotating((prev) => prev.filter(i => i !== id)), 2000);
  };

  const activeKeys = initialKeys.filter(k => k.status === "aktif").length;
  const limitKeys = initialKeys.filter(k => k.status === "limit").length;
  const totalUsage = Math.round(initialKeys.reduce((sum, k) => sum + k.usage, 0) / initialKeys.length);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen API Key</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Kelola dan rotasi API key untuk semua integrasi eksternal</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Tambah Key
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Key Aktif", value: `${activeKeys}`, color: "text-success" },
            { label: "Mendekati Limit", value: `${limitKeys}`, color: "text-destructive" },
            { label: "Avg. Penggunaan", value: `${totalUsage}%`, color: "text-warning" },
            { label: "Rotasi Otomatis", value: "Aktif", color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Alert for limit */}
        {limitKeys > 0 && (
          <div className="glass-card p-4 border-l-4 border-l-destructive flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold">Peringatan: {limitKeys} API key mendekati atau mencapai limit</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rotasi key sekarang atau tingkatkan kuota untuk menghindari gangguan layanan</p>
            </div>
          </div>
        )}

        {/* Keys */}
        <div className="space-y-3">
          {initialKeys.map((k, idx) => {
            const isVisible = visibleKeys.includes(k.id);
            const isRotating = rotating.includes(k.id);
            return (
              <div
                key={k.id}
                className={`glass-card p-5 space-y-4 animate-fade-in transition-all ${k.status === "limit" ? "border-destructive/30" : ""}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${k.status === "limit" ? "bg-destructive/10" : "bg-primary/10"}`}>
                      <Key className={`w-4 h-4 ${k.status === "limit" ? "text-destructive" : "text-primary"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{k.name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColors[k.category] || "bg-secondary text-muted-foreground border-border"}`}>
                          {k.category}
                        </span>
                        <Badge className={`text-[10px] flex items-center gap-1 ${k.status === "aktif" ? "bg-success/10 text-success border-success/20 border" : "bg-destructive/10 text-destructive border-destructive/20 border"}`}>
                          {k.status === "aktif" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                          {k.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">
                          {isVisible ? k.key.substring(0, 32) + "..." : k.masked}
                        </code>
                        <button onClick={() => toggleVisibility(k.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Terakhir digunakan: {k.lastUsed}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => handleRotate(k.id)}
                    >
                      <RefreshCw className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`} />
                      {isRotating ? "Merotasi..." : "Rotasi"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Penggunaan: {k.used.toLocaleString()} dari {k.limit}</span>
                    <span className={`font-semibold ${k.usage >= 90 ? "text-destructive" : k.usage >= 70 ? "text-warning" : "text-success"}`}>
                      {k.usage}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${k.usage >= 90 ? "bg-destructive" : k.usage >= 70 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${k.usage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    Rotasi otomatis pada {k.rotateAt} penggunaan
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rotation Policy */}
        <div className="glass-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Kebijakan Rotasi Otomatis</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sistem akan merotasi API key secara otomatis ketika penggunaan mencapai ambang batas yang dikonfigurasi.
            Key baru akan diaktifkan tanpa downtime menggunakan mekanisme blue-green rotation.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
