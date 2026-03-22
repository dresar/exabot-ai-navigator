import {
  Home, Crosshair, BarChart3, Brain, Wallet, FlaskConical, GraduationCap,
  Cpu, Key, Puzzle, ShieldCheck, ScrollText, Bell, Settings, BookOpen,
  HelpCircle, Activity
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Beranda", url: "/", icon: Home },
  { title: "Prediksi Langsung", url: "/prediksi", icon: Crosshair },
  { title: "Data Pasar", url: "/data-pasar", icon: BarChart3 },
  { title: "Analisis AI", url: "/analisis", icon: Brain },
  { title: "Simulasi", url: "/simulasi", icon: Wallet },
  { title: "Backtesting Lab", url: "/backtesting", icon: FlaskConical },
  { title: "Pelatihan AI", url: "/pelatihan", icon: GraduationCap },
  { title: "Model AI", url: "/model-ai", icon: Cpu },
  { title: "API Key", url: "/api-key", icon: Key },
  { title: "Pembuat Strategi", url: "/strategi", icon: Puzzle },
  { title: "Manajemen Risiko", url: "/risiko", icon: ShieldCheck },
  { title: "Log Aktivitas", url: "/log", icon: ScrollText },
  { title: "Notifikasi", url: "/notifikasi", icon: Bell },
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
  { title: "Dokumentasi", url: "/dokumentasi", icon: BookOpen },
  { title: "Bantuan", url: "/bantuan", icon: HelpCircle },
  { title: "Status Sistem", url: "/status", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="py-4">
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 mb-6 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              ExaBot
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium neon-glow"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span className="text-sm truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
