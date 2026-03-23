import {
  Home, Crosshair, BarChart3, Brain, Wallet, FlaskConical, GraduationCap,
  Cpu, Key, Puzzle, ShieldCheck, ScrollText, Bell, Settings, BookOpen,
  HelpCircle, Activity, ChevronRight, Zap, User, LogOut, Crown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { logoutRequest } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const coreMenuItems = [
  { title: "Beranda", url: "/", icon: Home },
  { title: "Prediksi Langsung", url: "/prediksi", icon: Crosshair, badge: "Live" },
  { title: "Data Pasar", url: "/data-pasar", icon: BarChart3 },
  { title: "Analisis AI", url: "/analisis", icon: Brain },
];

const tradeMenuItems = [
  { title: "Simulasi", url: "/simulasi", icon: Wallet },
  { title: "Backtesting Lab", url: "/backtesting", icon: FlaskConical },
  { title: "Pembuat Strategi", url: "/strategi", icon: Puzzle },
  { title: "Manajemen Risiko", url: "/risiko", icon: ShieldCheck },
];

const aiMenuItems = [
  { title: "Pelatihan AI", url: "/pelatihan", icon: GraduationCap },
  { title: "Model AI", url: "/model-ai", icon: Cpu },
  { title: "API Key", url: "/api-key", icon: Key },
];

const systemMenuItemsBase = [
  { title: "Log Aktivitas", url: "/log", icon: ScrollText },
  { title: "Notifikasi", url: "/notifikasi", icon: Bell, badge: undefined as string | undefined },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
  { title: "Dokumentasi", url: "/dokumentasi", icon: BookOpen },
  { title: "Bantuan", url: "/bantuan", icon: HelpCircle },
  { title: "Status Sistem", url: "/status", icon: Activity },
];

interface MenuItemProps {
  item: { title: string; url: string; icon: React.ElementType; badge?: string };
  collapsed: boolean;
}

function MenuItem({ item, collapsed }: MenuItemProps) {
  const location = useLocation();
  const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
  const Icon = item.icon;

  const content = (
    <NavLink
      to={item.url}
      end={item.url === "/"}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full ${
        isActive
          ? "bg-primary/12 text-primary font-semibold neon-glow border border-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
      activeClassName=""
    >
      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : ""}`} style={{ width: "1.125rem", height: "1.125rem" }} />
      {!collapsed && (
        <span className="text-sm truncate flex-1">{item.title}</span>
      )}
      {!collapsed && item.badge && (
        <Badge
          className={`text-[10px] h-4 px-1.5 shrink-0 ${
            item.badge === "Live"
              ? "bg-success/20 text-success border-success/30 border animate-pulse"
              : "bg-primary/20 text-primary border-primary/30 border"
          }`}
          variant="secondary"
        >
          {item.badge}
        </Badge>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.title}
              {item.badge && (
                <Badge className="text-[10px] h-4 px-1.5" variant="secondary">{item.badge}</Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>{content}</SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function MenuGroup({ label, items, collapsed }: { label: string; items: typeof coreMenuItems; collapsed: boolean }) {
  return (
    <SidebarGroup className="px-2 py-1">
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1 mb-1 font-semibold">
          {label}
        </SidebarGroupLabel>
      )}
      {collapsed && <div className="h-3" />}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <MenuItem key={item.url} item={item} collapsed={collapsed} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const { data: notifs } = useQuery({
    queryKey: ["notifications", "header"],
    queryFn: () => apiFetch<Array<{ is_read: boolean }>>("/notifications"),
  });
  const unread = (notifs ?? []).filter((n) => !n.is_read).length;
  const systemMenuItems = systemMenuItemsBase.map((it) =>
    it.title === "Notifikasi" && unread > 0 ? { ...it, badge: String(unread) } : { ...it }
  );

  const logout = async () => {
    await logoutRequest();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar glass-sidebar">
      <SidebarContent className="pb-4">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 mb-1 border-b border-sidebar-border/50 ${collapsed ? "justify-center px-2" : ""}`}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center shadow-lg neon-glow">
              <Zap className="w-4.5 h-4.5 text-white" style={{ width: "1.125rem", height: "1.125rem" }} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-sidebar status-dot-green" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base leading-none gradient-text">ExaBot</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">AI Prediction Engine</div>
            </div>
          )}
        </div>

        {/* Version badge */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/8 border border-primary/15">
              <Crown className="w-3.5 h-3.5 text-warning shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-primary">{me?.plan ?? "Pro"} Plan</div>
                <div className="text-[10px] text-muted-foreground">Aktif</div>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
            </div>
          </div>
        )}

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto">
          <MenuGroup label="Utama" items={coreMenuItems} collapsed={collapsed} />
          <MenuGroup label="Trading" items={tradeMenuItems} collapsed={collapsed} />
          <MenuGroup label="AI Engine" items={aiMenuItems} collapsed={collapsed} />
          <MenuGroup label="Sistem" items={systemMenuItems} collapsed={collapsed} />
        </div>

        {/* User Profile */}
        {!collapsed && (
          <button
            type="button"
            onClick={logout}
            className="mx-2 mt-2 p-3 rounded-xl border border-sidebar-border/50 bg-sidebar-accent/50 flex items-center gap-2.5 group cursor-pointer hover:bg-sidebar-accent transition-colors w-[calc(100%-1rem)] text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{me?.username ?? "…"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{me?.email ?? ""}</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
