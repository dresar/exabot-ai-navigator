import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, AlertTriangle, Lock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

type RiskOut = {
  id: string;
  max_daily_loss: number;
  max_bet_per_event: number;
  min_confidence: number;
  max_drawdown: number;
  stop_loss_enabled: boolean;
  risk_notifications: boolean;
  conservative_mode: boolean;
  anti_martingale: boolean;
  drawdown_protection: boolean;
  correlation_limit: boolean;
  category_allocations: { category: string; allocation: number }[];
};

export default function ManajemenRisiko() {
  const qc = useQueryClient();
  const riskQ = useQuery({
    queryKey: ["risk", "settings"],
    queryFn: () => apiFetch<RiskOut>("/risk/settings"),
  });

  const [form, setForm] = useState<Partial<RiskOut>>({});

  useEffect(() => {
    if (riskQ.data) setForm(riskQ.data);
  }, [riskQ.data]);

  const saveM = useMutation({
    mutationFn: () =>
      apiFetch<RiskOut>("/risk/settings", {
        method: "PUT",
        body: JSON.stringify({
          max_daily_loss: form.max_daily_loss,
          max_bet_per_event: form.max_bet_per_event,
          min_confidence: form.min_confidence,
          max_drawdown: form.max_drawdown,
          stop_loss_enabled: form.stop_loss_enabled,
          risk_notifications: form.risk_notifications,
          conservative_mode: form.conservative_mode,
          anti_martingale: form.anti_martingale,
          drawdown_protection: form.drawdown_protection,
          correlation_limit: form.correlation_limit,
        }),
      }),
    onSuccess: () => {
      toast.success("Pengaturan risiko disimpan");
      qc.invalidateQueries({ queryKey: ["risk"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  if (riskQ.isError) {
    return (
      <DashboardLayout>
        <p className="text-destructive">Gagal memuat pengaturan risiko</p>
      </DashboardLayout>
    );
  }

  const riskLevel =
    form.stop_loss_enabled && form.anti_martingale ? "Rendah" : form.risk_notifications ? "Sedang" : "Tinggi";
  const riskColor = riskLevel === "Rendah" ? "text-success" : riskLevel === "Sedang" ? "text-warning" : "text-destructive";

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Risiko</h1>
            <p className="text-muted-foreground text-sm mt-0.5">GET/PUT /risk/settings</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1.5 text-sm font-semibold border ${riskColor}`}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Risiko {riskLevel}
            </Badge>
            <Button size="sm" onClick={() => saveM.mutate()} disabled={saveM.isPending || riskQ.isLoading}>
              {saveM.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </div>

        {riskQ.isLoading && <p className="text-muted-foreground text-sm">Memuat…</p>}

        <div className="glass-card p-4 border-l-4 border-l-warning flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Parameter disimpan ke backend. Gunakan nilai yang sesuai toleransi Anda.
          </p>
        </div>

        {!riskQ.isLoading && form.id && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Limit</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Max loss harian</span>
                    <span className="font-semibold">{form.max_daily_loss ?? 0}</span>
                  </div>
                  <Slider
                    value={[form.max_daily_loss ?? 0]}
                    max={200000}
                    step={1000}
                    onValueChange={([v]) => setForm((f) => ({ ...f, max_daily_loss: v }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Max bet / event</span>
                    <span className="font-semibold">{form.max_bet_per_event ?? 0}</span>
                  </div>
                  <Slider
                    value={[form.max_bet_per_event ?? 0]}
                    max={100000}
                    step={500}
                    onValueChange={([v]) => setForm((f) => ({ ...f, max_bet_per_event: v }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Min confidence (%)</span>
                    <span className="font-semibold">{form.min_confidence ?? 0}</span>
                  </div>
                  <Slider
                    value={[form.min_confidence ?? 0]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setForm((f) => ({ ...f, min_confidence: v }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Max drawdown (%)</span>
                    <span className="font-semibold">{form.max_drawdown ?? 0}</span>
                  </div>
                  <Slider
                    value={[form.max_drawdown ?? 0]}
                    max={50}
                    step={1}
                    onValueChange={([v]) => setForm((f) => ({ ...f, max_drawdown: v }))}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Target className="w-4 h-4 text-cyan-500" />
                </div>
                <h3 className="font-semibold text-sm">Sakelar</h3>
              </div>
              {[
                { key: "stop_loss_enabled" as const, label: "Stop-loss otomatis" },
                { key: "risk_notifications" as const, label: "Notifikasi risiko" },
                { key: "conservative_mode" as const, label: "Mode konservatif" },
                { key: "anti_martingale" as const, label: "Anti-martingale" },
                { key: "drawdown_protection" as const, label: "Proteksi drawdown" },
                { key: "correlation_limit" as const, label: "Batas korelasi" },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between">
                  <span className="text-sm">{row.label}</span>
                  <Switch
                    checked={!!form[row.key]}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, [row.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {form.category_allocations && form.category_allocations.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3">Alokasi kategori (dari server)</h3>
            <ul className="space-y-2 text-sm">
              {form.category_allocations.map((c) => (
                <li key={c.category} className="flex justify-between">
                  <span>{c.category}</span>
                  <span className="font-mono">{c.allocation}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
