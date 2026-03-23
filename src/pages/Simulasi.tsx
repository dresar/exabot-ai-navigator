import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, Trophy, XCircle, Plus, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { toNum } from "@/lib/format";
import { toast } from "sonner";

type Account = {
  id: string;
  balance: string | number;
  initial_balance: string | number;
  total_profit: string | number;
  wins: number;
  losses: number;
  win_rate: number;
};

type Trade = {
  id: string;
  event_id: string | null;
  position: string;
  amount: string | number;
  ai_probability: string | number | null;
  entry_price: string | number | null;
  result: string;
  profit: string | number;
  created_at: string;
};

type HistoryResp = { items: Trade[]; total: number };

function fmtMoney(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function Simulasi() {
  const qc = useQueryClient();

  const accountQ = useQuery({
    queryKey: ["simulation", "account"],
    queryFn: () => apiFetch<Account>("/simulation/account"),
    retry: false,
  });

  const historyQ = useQuery({
    queryKey: ["simulation", "history"],
    queryFn: () => apiFetch<HistoryResp>("/simulation/history?limit=50&page=1"),
    enabled: accountQ.isSuccess,
  });

  const resetM = useMutation({
    mutationFn: () => apiFetch("/simulation/reset", { method: "POST" }),
    onSuccess: () => {
      toast.success("Akun simulasi direset");
      qc.invalidateQueries({ queryKey: ["simulation"] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof ApiError ? e.message : "Gagal reset");
    },
  });

  const acc = accountQ.data;
  const balance = acc ? toNum(acc.balance) : 0;
  const initial = acc ? toNum(acc.initial_balance) : 0;
  const profit = acc ? toNum(acc.total_profit) : 0;
  const winRate = acc?.win_rate ?? 0;
  const items = historyQ.data?.items ?? [];

  const chartData = useMemo(() => {
    return items.slice(0, 15).map((t, i) => ({
      n: String(i + 1),
      profit: toNum(t.profit),
    }));
  }, [items]);

  const noAccount = accountQ.isError || (accountQ.isSuccess && !acc);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simulasi (Paper Trading)</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Data dari API · akun dibuat saat registrasi</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={resetM.isPending || noAccount}
              onClick={() => resetM.mutate()}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetM.isPending ? "animate-spin" : ""}`} />
              Reset
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" variant="secondary" disabled>
              <Plus className="w-3.5 h-3.5" />
              Prediksi Baru
            </Button>
          </div>
        </div>

        {accountQ.isLoading && <p className="text-sm text-muted-foreground">Memuat akun simulasi…</p>}
        {noAccount && (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">
            Akun simulasi tidak ditemukan. Pastikan backend sudah migrasi dan Anda terdaftar.
          </div>
        )}

        {acc && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Saldo Virtual"
                value={fmtMoney(balance)}
                change={`Awal: ${fmtMoney(initial)}`}
                changeType="positive"
                icon={Wallet}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
                pulse
              />
              <StatCard
                title="Total Profit"
                value={fmtMoney(profit)}
                change="kumulatif"
                changeType={profit >= 0 ? "positive" : "negative"}
                icon={TrendingUp}
                iconBg="bg-cyan-500/10"
                iconColor="text-cyan-500"
              />
              <StatCard
                title="Menang"
                value={String(acc.wins)}
                change="trade terselesaikan"
                changeType="positive"
                icon={Trophy}
                iconBg="bg-success/10"
                iconColor="text-success"
              />
              <StatCard
                title="Kalah"
                value={String(acc.losses)}
                change={`win rate ${winRate.toFixed(1)}%`}
                changeType="negative"
                icon={XCircle}
                iconBg="bg-destructive/10"
                iconColor="text-destructive"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-sm font-semibold">Statistik Performa</h3>
                <div className="text-center py-2">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="hsl(142,76%,42%)"
                        strokeWidth="3"
                        strokeDasharray={`${Math.min(100, winRate)} ${100 - Math.min(100, winRate)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-success">{winRate.toFixed(0)}%</span>
                      <span className="text-[10px] text-muted-foreground">Win Rate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold">Profit per transaksi (terbaru)</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Hingga 15 entri</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {items.length} trade
                  </Badge>
                </div>
                {chartData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    Belum ada riwayat transaksi
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis dataKey="n" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: number) => [fmtMoney(v), "Profit"]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      />
                      <Bar dataKey="profit" maxBarSize={28}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={chartData[i].profit >= 0 ? "hsl(142,76%,42%)" : "hsl(0,72%,51%)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50">
                <h3 className="text-sm font-semibold">Histori Prediksi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th className="text-center">Waktu</th>
                      <th className="text-center">Posisi</th>
                      <th className="text-center">Jumlah</th>
                      <th className="text-center">AI Prob</th>
                      <th className="text-center">Hasil</th>
                      <th className="text-center">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQ.isLoading && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          Memuat…
                        </td>
                      </tr>
                    )}
                    {!historyQ.isLoading &&
                      items.map((h) => {
                        let tstr = "—";
                        try {
                          tstr = format(parseISO(h.created_at), "dd MMM yyyy HH:mm", { locale: idLocale });
                        } catch {
                          /* */
                        }
                        const p = toNum(h.profit);
                        const ai = h.ai_probability != null ? toNum(h.ai_probability) : null;
                        return (
                          <tr key={h.id}>
                            <td className="font-mono text-xs">{h.event_id ? `${h.event_id.slice(0, 8)}…` : "—"}</td>
                            <td className="text-center text-muted-foreground text-xs">{tstr}</td>
                            <td className="text-center">
                              <Badge
                                className={`text-[10px] ${
                                  h.position === "YES"
                                    ? "bg-success/10 text-success border-success/20 border"
                                    : "bg-destructive/10 text-destructive border-destructive/20 border"
                                }`}
                              >
                                {h.position}
                              </Badge>
                            </td>
                            <td className="text-center text-sm">{fmtMoney(toNum(h.amount))}</td>
                            <td className="text-center text-xs font-bold">{ai != null ? `${ai.toFixed(0)}%` : "—"}</td>
                            <td className="text-center">
                              <Badge variant="secondary" className="text-[10px]">
                                {h.result}
                              </Badge>
                            </td>
                            <td className={`text-center font-bold text-sm ${p >= 0 ? "text-success" : "text-destructive"}`}>
                              {p >= 0 ? "+" : ""}
                              {fmtMoney(p)}
                            </td>
                          </tr>
                        );
                      })}
                    {!historyQ.isLoading && items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          Belum ada transaksi simulasi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
