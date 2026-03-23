import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, Bell, Moon, Sun, User, Settings, LogOut, ChevronDown, Zap, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { logoutRequest } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useExabotWebSocketChannel } from "@/hooks/useExabotWebSocket";

type NotifRow = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string | null;
};

function mapCategoryToType(cat: string): "success" | "warning" | "info" {
  const c = cat.toLowerCase();
  if (c.includes("alert") || c.includes("warning") || c.includes("risk")) return "warning";
  if (c.includes("success") || c.includes("complete") || c.includes("model")) return "success";
  return "info";
}

const notifIcon = {
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
  warning: <AlertCircle className="w-4 h-4 text-warning" />,
  info: <Info className="w-4 h-4 text-primary" />,
};

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: me } = useCurrentUser();

  const onWs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["notifications", "header"] });
  }, [qc]);
  useExabotWebSocketChannel("notifications", onWs);

  const notifQ = useQuery({
    queryKey: ["notifications", "header"],
    queryFn: () => apiFetch<NotifRow[]>("/notifications"),
    refetchInterval: 60_000,
  });

  const allNotifications = notifQ.data ?? [];
  const notifications = allNotifications.slice(0, 8);
  const unreadCount = allNotifications.filter((n) => !n.is_read).length;

  const logout = async () => {
    await logoutRequest();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

        <div className="hidden sm:flex items-center relative w-64 lg:w-80">
          <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari halaman, event, model..."
            className="pl-9 h-8 bg-secondary/60 border-border/40 text-sm rounded-lg focus:bg-background transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 text-[10px] text-muted-foreground hidden md:block">⌘K</div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 ml-2 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-success font-medium">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium mr-1">
          <Zap className="w-3 h-3" />
          <span>AI Aktif</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-8 h-8 text-muted-foreground hover:text-foreground transition-all hover:bg-secondary"
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4 transition-all" />
            : <Moon className="w-4 h-4 transition-all" />
          }
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 relative text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] text-white font-bold flex items-center justify-center border border-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-secondary/30">
              <DropdownMenuLabel className="p-0 font-semibold">Notifikasi</DropdownMenuLabel>
              <Badge variant="secondary" className="text-[10px]">{unreadCount} baru</Badge>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifQ.isLoading && (
                <div className="px-4 py-6 text-xs text-muted-foreground">Memuat…</div>
              )}
              {!notifQ.isLoading && notifications.length === 0 && (
                <div className="px-4 py-6 text-xs text-muted-foreground">Tidak ada notifikasi</div>
              )}
              {notifications.map((notif) => {
                const t = mapCategoryToType(notif.category);
                let timeLabel = "";
                try {
                  if (notif.created_at) {
                    timeLabel = formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true, locale: idLocale });
                  }
                } catch {
                  timeLabel = "";
                }
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-secondary/30 ${!notif.is_read ? "bg-primary/3" : ""}`}
                    onClick={() => apiFetch(`/notifications/${notif.id}/read`, { method: "PATCH" }).then(() => notifQ.refetch())}
                  >
                    <div className="mt-0.5 shrink-0">{notifIcon[t]}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-tight ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.description ?? ""}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-border/50 bg-secondary/20">
              <button
                type="button"
                className="text-xs text-primary hover:underline font-medium w-full text-center"
                onClick={() => navigate("/notifikasi")}
              >
                Lihat semua notifikasi
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-secondary transition-colors group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-tight">{me?.username ?? "…"}</div>
                <div className="text-[10px] text-muted-foreground">{me?.plan ?? ""} Plan</div>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{me?.username ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{me?.email ?? ""}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/pengaturan")}>
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
