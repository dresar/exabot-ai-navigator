import { Home, Crosshair, BarChart3, Brain, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const items = [
  { title: "Beranda", url: "/", icon: Home },
  { title: "Prediksi", url: "/prediksi", icon: Crosshair },
  { title: "Pasar", url: "/data-pasar", icon: BarChart3 },
  { title: "AI", url: "/analisis", icon: Brain },
  { title: "Lainnya", url: "/pengaturan", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              activeClassName=""
            >
              <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--neon-blue)/0.6)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
