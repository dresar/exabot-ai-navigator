import { Home, Crosshair, BarChart3, Brain, Bell } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Beranda", path: "/", icon: Home },
  { label: "Prediksi", path: "/prediksi", icon: Crosshair },
  { label: "Pasar", path: "/data-pasar", icon: BarChart3 },
  { label: "Analisis", path: "/analisis", icon: Brain },
  { label: "Notifikasi", path: "/notifikasi", icon: Bell, badge: 3 },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ label, path, icon: Icon, badge }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl mx-0.5 transition-all duration-200 relative ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute top-2 w-6 h-1 rounded-full bg-primary/60" />
              )}
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-5 h-5" />
                {badge && !isActive && (
                  <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 flex items-center justify-center text-[8px] bg-primary border-0">
                    {badge}
                  </Badge>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : ""}`}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
