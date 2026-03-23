import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { apiFetch, getApiBase } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type LogItem = {
  id: string;
  log_type: string;
  event_name: string | null;
  action: string;
  status: string;
  created_at: string | null;
};

type LogsResp = { items: LogItem[]; total: number };

const typeColors: Record<string, string> = {
  prediksi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  sistem: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  api: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  risiko: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const statusIcon: Record<string, ReactNode> = {
  sukses: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-warning" />,
  error: <XCircle className="w-3.5 h-3.5 text-destructive" />,
};

const types = ["Semua", "prediksi", "sistem", "api", "risiko", "training"];

export default function LogAktivitas() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeType, setActiveType] = useState("Semua");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  const logsQ = useQuery({
    queryKey: ["logs", activeType, debouncedSearch],
    queryFn: async () => {
      const p = new URLSearchParams({ page: "1", limit: "100" });
      if (activeType !== "Semua") p.set("type", activeType);
      if (debouncedSearch.trim()) p.set("search", debouncedSearch.trim());
      return apiFetch<LogsResp>(`/logs?${p.toString()}`);
    },
  });

  const items = logsQ.data?.items ?? [];

  const stats = useMemo(() => {
    const sukses = items.filter((l) => l.status === "sukses").length;
    const err = items.filter((l) => l.status === "error").length;
    const warn = items.filter((l) => l.status === "warning").length;
    return { total: items.length, sukses, err, warn };
  }, [items]);

  const exportCsv = async () => {
    const token = getAccessToken();
    const res = await fetch(`${getApiBase()}/logs/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Data dari GET /logs</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={exportCsv} type="button">
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </Button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { label: "Total (halaman)", value: String(logsQ.data?.total ?? items.length), color: "" },
            { label: "Sukses", value: String(stats.sukses), color: "text-success" },
            { label: "Warning", value: String(stats.warn), color: "text-warning" },
            { label: "Error", value: String(stats.err), color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{logsQ.isLoading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari aktivitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border capitalize ${
                  activeType === t ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {logsQ.isError && <p className="text-sm text-destructive">Gagal memuat log</p>}

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th className="text-center">Tipe</th>
                  <th>Aktivitas</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {logsQ.isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Memuat…
                    </td>
                  </tr>
                )}
                {!logsQ.isLoading &&
                  items.map((l, i) => {
                    let timeStr = "—";
                    let dateStr = "";
                    try {
                      if (l.created_at) {
                        const d = parseISO(l.created_at);
                        timeStr = format(d, "HH:mm:ss", { locale: idLocale });
                        dateStr = format(d, "dd MMM yyyy", { locale: idLocale });
                      }
                    } catch {
                      /* */
                    }
                    const st = l.status;
                    return (
                      <tr key={l.id} className="cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="whitespace-nowrap">
                          <div className="font-mono text-xs font-medium">{timeStr}</div>
                          <div className="text-[10px] text-muted-foreground">{dateStr}</div>
                        </td>
                        <td className="text-center">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                              typeColors[l.log_type] || "bg-secondary text-muted-foreground border-border"
                            }`}
                          >
                            {l.log_type}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm">{l.action}</span>
                          {l.event_name && (
                            <span className="ml-1.5 text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{l.event_name}</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {statusIcon[st] ?? <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span
                              className={`text-xs font-medium ${
                                st === "sukses" ? "text-success" : st === "warning" ? "text-warning" : "text-destructive"
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!logsQ.isLoading && items.length === 0 && (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada log atau data belum tersedia</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
