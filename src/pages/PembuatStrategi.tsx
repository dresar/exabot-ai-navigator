import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowRight, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

type Condition = {
  id: string;
  parameter: string;
  operator: string;
  threshold_value: string | number;
  action: string;
  order_index: number;
};

type Strategy = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  triggered_count: number;
  win_count: number;
  loss_count: number;
  conditions: Condition[];
};

export default function PembuatStrategi() {
  const qc = useQueryClient();
  const strategiesQ = useQuery({
    queryKey: ["strategies"],
    queryFn: () => apiFetch<Strategy[]>("/strategies"),
  });

  const toggleM = useMutation({
    mutationFn: (id: string) => apiFetch<Strategy>(`/strategies/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => apiFetch(`/strategies/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Strategi dihapus");
      qc.invalidateQueries({ queryKey: ["strategies"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  const strategies = strategiesQ.data ?? [];
  const totalTrig = strategies.reduce((s, x) => s + x.triggered_count, 0);
  const avgWin =
    strategies.length > 0
      ? Math.round(strategies.reduce((s, x) => s + (x.win_count / Math.max(1, x.win_count + x.loss_count)) * 100, 0) / strategies.length)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pembuat Strategi</h1>
            <p className="text-muted-foreground text-sm mt-0.5">GET /strategies</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" variant="secondary" disabled>
            <Plus className="w-3.5 h-3.5" />
            Strategi Baru
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: String(strategies.length) },
            { label: "Aktif", value: String(strategies.filter((s) => s.is_active).length), color: "text-success" },
            { label: "Trigger", value: String(totalTrig) },
            { label: "Est. win mix", value: strategies.length ? `~${avgWin}%` : "—", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-lg font-bold mt-0.5 ${s.color ?? ""}`}>{strategiesQ.isLoading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {strategiesQ.isError && <p className="text-destructive text-sm">Gagal memuat strategi</p>}

        <div className="space-y-3">
          {strategiesQ.isLoading && <p className="text-muted-foreground text-sm">Memuat…</p>}
          {!strategiesQ.isLoading &&
            strategies.map((st, idx) => (
              <div key={st.id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{st.name}</h3>
                      <Badge variant={st.is_active ? "default" : "secondary"} className="text-[10px]">
                        {st.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{st.description ?? "—"}</p>
                    <div className="flex gap-4 text-[11px] text-muted-foreground">
                      <span>Trigger: {st.triggered_count}</span>
                      <span>Menang: {st.win_count}</span>
                      <span>Kalah: {st.loss_count}</span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      {st.conditions.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="text-muted-foreground font-mono">{c.parameter}</span>
                          <span className="font-bold">{c.operator}</span>
                          <span>{String(c.threshold_value)}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-primary">{c.action}</span>
                        </div>
                      ))}
                      {st.conditions.length === 0 && <p className="text-xs text-muted-foreground">Tidak ada kondisi</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <Switch checked={st.is_active} onCheckedChange={() => toggleM.mutate(st.id)} disabled={toggleM.isPending} />
                      <span className="text-[10px] text-muted-foreground">Aktif</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive h-8" onClick={() => confirm("Hapus?") && delM.mutate(st.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!strategiesQ.isLoading && strategies.length === 0 && (
          <div className="glass-card py-14 text-center text-sm text-muted-foreground">Belum ada strategi. Buat lewat API POST /strategies</div>
        )}
      </div>
    </DashboardLayout>
  );
}
