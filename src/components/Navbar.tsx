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

const notifications = [
  { id: 1, type: "success", title: "Model AI Diperbarui", desc: "Ensemble v3.2 telah selesai training", time: "2 menit lalu", read: false },
  { id: 2, type: "warning", title: "Batas API Key", desc: "Key OpenAI mendekati limit (90%)", time: "15 menit lalu", read: false },
  { id: 3, type: "info", title: "Prediksi Baru", desc: "5 prediksi baru tersedia di pasar", time: "1 jam lalu", read: false },
  { id: 4, type: "success", title: "Backtesting Selesai", desc: "Hasil: akurasi 89.2%, Brier 0.12", time: "3 jam lalu", read: true },
];

const notifIcon = {
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
  warning: <AlertCircle className="w-4 h-4 text-warning" />,
  info: <Info className="w-4 h-4 text-primary" />,
};

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 gap-3 sticky top-0 z-30">
      {/* Left */}
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

        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-1.5 ml-2 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-success font-medium">Live</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        {/* AI Status pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium mr-1">
          <Zap className="w-3 h-3" />
          <span>AI Aktif</span>
        </div>

        {/* Theme toggle */}
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

        {/* Notifications */}
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
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-secondary/30 ${!notif.read ? "bg-primary/3" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">{notifIcon[notif.type as keyof typeof notifIcon]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border/50 bg-secondary/20">
              <button
                className="text-xs text-primary hover:underline font-medium w-full text-center"
                onClick={() => navigate("/notifikasi")}
              >
                Lihat semua notifikasi
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-secondary transition-colors group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold leading-tight">Ahmad Fadhil</div>
                <div className="text-[10px] text-muted-foreground">Pro Plan</div>
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
                  <p className="text-sm font-semibold">Ahmad Fadhil</p>
                  <p className="text-xs text-muted-foreground">fadhil@exabot.ai</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/pengaturan")}>
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
