import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Copy, Shield, CheckCircle2, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

type ApiKeyRow = {
  id: string;
  name: string;
  provider: string;
  key_masked: string;
  category: string | null;
  status: string;
  usage_count: number;
  daily_limit: number | null;
  daily_usage: number;
  rotate_at_threshold: number;
  is_auto_rotate: boolean;
  last_used_at: string | null;
};

const categoryColors: Record<string, string> = {
  Pasar: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  AI: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Data: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sosial: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Kripto: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function usagePct(k: ApiKeyRow): number {
  if (!k.daily_limit || k.daily_limit <= 0) return 0;
  return Math.min(100, Math.round((k.daily_usage / k.daily_limit) * 100));
}

function statusLabel(s: string): string {
  if (s === "active") return "aktif";
  if (s === "limit") return "limit";
  return s;
}

export default function ManajemenAPIKey() {
  const qc = useQueryClient();
  const keysQ = useQuery({
    queryKey: ["keys"],
    queryFn: () => apiFetch<ApiKeyRow[]>("/keys"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => apiFetch(`/keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Key dihapus");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal hapus"),
  });

  const rotateM = useMutation({
    mutationFn: async ({ id, key_value }: { id: string; key_value: string }) =>
      apiFetch(`/keys/${id}/rotate`, { method: "POST", body: JSON.stringify({ key_value }) }),
    onSuccess: () => {
      toast.success("Key dirotasi");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal rotasi"),
  });

  const keys = keysQ.data ?? [];
  const activeKeys = keys.filter((k) => k.status === "active").length;
  const limitKeys = keys.filter((k) => k.status === "limit").length;
  const avgUsage =
    keys.length > 0 ? Math.round(keys.reduce((s, k) => s + usagePct(k), 0) / keys.length) : 0;

  const copyMasked = (masked: string) => {
    void navigator.clipboard.writeText(masked);
    toast.message("Disalin (hanya tampilan mask)");
  };

  const handleRotate = (id: string) => {
    const v = window.prompt("Masukkan nilai API key baru untuk rotasi:");
    if (v && v.trim()) rotateM.mutate({ id, key_value: v.trim() });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen API Key</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Data dari backend · secret tidak pernah ditampilkan penuh</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" variant="secondary" disabled>
            <Plus className="w-3.5 h-3.5" />
            Tambah Key
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Key Aktif", value: String(activeKeys), color: "text-success" },
            { label: "Mendekati Limit", value: String(limitKeys), color: "text-destructive" },
            { label: "Avg. Penggunaan harian", value: `${avgUsage}%`, color: "text-warning" },
            { label: "Total", value: String(keys.length), color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{keysQ.isLoading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {limitKeys > 0 && (
          <div className="glass-card p-4 border-l-4 border-l-destructive flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold">{limitKeys} key berstatus limit</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rotasi atau naikkan kuota di penyedia API</p>
            </div>
          </div>
        )}

        {keysQ.isError && <p className="text-sm text-destructive">Gagal memuat API keys</p>}

        <div className="space-y-3">
          {keysQ.isLoading && <p className="text-muted-foreground text-sm">Memuat…</p>}
          {!keysQ.isLoading &&
            keys.map((k, idx) => {
              const pct = usagePct(k);
              const cat = k.category ?? "Umum";
              const lim = k.daily_limit != null ? `${k.daily_usage.toLocaleString()}/${k.daily_limit.toLocaleString()}/hari` : "—";
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
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              categoryColors[cat] || "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {cat}
                          </span>
                          <Badge
                            className={`text-[10px] flex items-center gap-1 ${
                              k.status === "active" ? "bg-success/10 text-success border-success/20 border" : "bg-destructive/10 text-destructive border-destructive/20 border"
                            }`}
                          >
                            {k.status === "active" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                            {statusLabel(k.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded font-mono">{k.key_masked}</code>
                          <button type="button" onClick={() => copyMasked(k.key_masked)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Provider: {k.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        disabled={rotateM.isPending}
                        onClick={() => handleRotate(k.id)}
                      >
                        <RefreshCw className={`w-3 h-3 ${rotateM.isPending ? "animate-spin" : ""}`} />
                        Rotasi
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Hapus key ini?")) delM.mutate(k.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Penggunaan harian: {lim}</span>
                      <span className={`font-semibold ${pct >= 90 ? "text-destructive" : pct >= 70 ? "text-warning" : "text-success"}`}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      Rotasi otomatis pada {k.rotate_at_threshold}% · auto={k.is_auto_rotate ? "ya" : "tidak"}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!keysQ.isLoading && keys.length === 0 && (
          <div className="glass-card py-14 text-center text-sm text-muted-foreground">Belum ada API key. Tambahkan lewat API atau seed database.</div>
        )}

        <div className="glass-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Kebijakan</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nilai secret tidak ditampilkan setelah disimpan. Gunakan rotasi dengan key baru dari penyedia (OpenAI, Polymarket, dll.).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
