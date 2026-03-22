import { DashboardLayout } from "@/components/DashboardLayout";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Pengaturan() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground text-sm mt-1">Konfigurasi preferensi dan sistem</p>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">Tampilan</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning" />}
              <div><p className="text-sm font-medium">Tema</p><p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark mode aktif" : "Light mode aktif"}</p></div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Bahasa</p><p className="text-xs text-muted-foreground">Pilih bahasa antarmuka</p></div>
            <Select defaultValue="id"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="id">Bahasa Indonesia</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">Profil Pengguna</h3>
          <div className="space-y-3">
            <div><label className="text-sm text-muted-foreground">Nama</label><Input defaultValue="Admin ExaBot" className="mt-1" /></div>
            <div><label className="text-sm text-muted-foreground">Email</label><Input defaultValue="admin@exabot.ai" className="mt-1" /></div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">Konfigurasi Sistem</h3>
          {[
            { label: "Notifikasi push", desc: "Terima notifikasi real-time", on: true },
            { label: "Auto-refresh data", desc: "Perbarui data otomatis setiap 30 detik", on: true },
            { label: "Mode hemat data", desc: "Kurangi frekuensi update untuk koneksi lambat", on: false },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
              <Switch defaultChecked={t.on} />
            </div>
          ))}
        </div>

        <Button>Simpan Perubahan</Button>
      </div>
    </DashboardLayout>
  );
}
