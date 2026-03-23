import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Brain, Key, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

type NotifRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  is_read: boolean;
  is_urgent: boolean;
  created_at: string | null;
};

const categoryColorMap: Record<string, string> = {
  AI: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  API: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Sistem: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Risiko: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Training: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

function iconFor(cat: string) {
  const c = cat.toUpperCase();
  if (c.includes("API")) return Key;
  if (c.includes("RISIK") || c.includes("RISK")) return AlertTriangle;
  if (c.includes("TRAIN")) return Brain;
  if (c.includes("AI")) return Brain;
  return Info;
}

export default function Notifikasi() {
  const qc = useQueryClient();
  const notifQ = useQuery({
    queryKey: ["notifications", "full"],
    queryFn: () => apiFetch<NotifRow[]>("/notifications"),
  });

  const markReadM = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal"),
  });

  const markAllM = useMutation({
    mutationFn: () => apiFetch("/notifications/read-all", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const [activeFilter, setActiveFilter] = useState("Semua");

  const notifs = notifQ.data ?? [];
  const categoryFilters = useMemo(() => {
    const s = new Set<string>();
    for (const n of notifs) {
      if (n.category) s.add(n.category);
    }
    return ["Semua", ...Array.from(s).sort((a, b) => a.localeCompare(b, "id"))];
  }, [notifs]);
  const unreadCount = notifs.filter((n) => !n.is_read).length;
  const filtered =
    activeFilter === "Semua" ? notifs : notifs.filter((n) => n.category === activeFilter);

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary/15 text-primary border-primary/25 border text-xs px-2 py-0.5">{unreadCount} baru</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">Dari backend · WebSocket memperbarui daftar di navbar</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={markAllM.isPending} onClick={() => markAllM.mutate()}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeFilter === f ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {notifQ.isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
        {notifQ.isError && <p className="text-sm text-destructive">Gagal memuat notifikasi</p>}

        <div className="space-y-2">
          {!notifQ.isLoading &&
            filtered.map((n, idx) => {
              const Icon = iconFor(n.category);
              const time =
                n.created_at &&
                (() => {
                  try {
                    return formatDistanceToNow(parseISO(n.created_at), { addSuffix: true, locale: idLocale });
                  } catch {
                    return "";
                  }
                })();
              return (
                <div
                  key={n.id}
                  className={`glass-card p-4 flex items-start gap-4 transition-all duration-200 animate-fade-in group ${
                    !n.is_read ? "border-l-4 border-l-primary" : ""
                  } ${n.is_urgent && !n.is_read ? "border-l-destructive" : ""}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => !n.is_read && markReadM.mutate(n.id)}
                  onKeyDown={(e) => e.key === "Enter" && !n.is_read && markReadM.mutate(n.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-2.5 rounded-xl bg-secondary/80 border border-border/50 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-semibold ${!n.is_read ? "" : "text-muted-foreground"}`}>{n.title}</h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              categoryColorMap[n.category] || "bg-secondary border-border text-muted-foreground"
                            }`}
                          >
                            {n.category}
                          </span>
                          {n.is_urgent && !n.is_read && (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 border text-[10px]">Mendesak</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{n.description ?? ""}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">{time}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteM.mutate(n.id);
                    }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
        </div>

        {!notifQ.isLoading && filtered.length === 0 && (
          <div className="glass-card py-16 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Tidak ada notifikasi</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Backend belum mengirim notifikasi atau filter tidak cocok</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
