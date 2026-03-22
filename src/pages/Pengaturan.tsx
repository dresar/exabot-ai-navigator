import { DashboardLayout } from "@/components/DashboardLayout";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, Settings, Bell, Shield, Globe, Palette, RefreshCw, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const sections = [
  { id: "tampilan", label: "Tampilan", icon: Palette },
  { id: "profil", label: "Profil", icon: User },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "sistem", label: "Sistem", icon: Settings },
  { id: "keamanan", label: "Keamanan", icon: Shield },
];

export default function Pengaturan() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("tampilan");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Konfigurasi preferensi tampilan, profil, dan sistem</p>
          </div>
          <Button
            size="sm"
            className={`text-xs gap-1.5 transition-all ${saved ? "bg-success hover:bg-success" : ""}`}
            onClick={handleSave}
          >
            {saved ? "Tersimpan ✓" : "Simpan Perubahan"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar Nav */}
          <div className="lg:w-52 shrink-0">
            <div className="glass-card p-2 flex flex-row lg:flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <s.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:block">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {activeSection === "tampilan" && (
              <div className="glass-card p-5 space-y-5 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Tampilan & Tema
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-800" : "bg-yellow-50"}`}>
                        {theme === "dark" ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Mode Gelap</p>
                        <p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark mode aktif" : "Light mode aktif"}</p>
                      </div>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bahasa Antarmuka</p>
                      <p className="text-xs text-muted-foreground">Bahasa yang digunakan di seluruh aplikasi</p>
                    </div>
                    <Select defaultValue="id">
                      <SelectTrigger className="w-44 h-9 bg-secondary/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Kepadatan Tampilan</p>
                      <p className="text-xs text-muted-foreground">Jarak antar elemen UI</p>
                    </div>
                    <Select defaultValue="normal">
                      <SelectTrigger className="w-44 h-9 bg-secondary/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Kompak</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="comfortable">Nyaman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Animasi Antarmuka</p>
                      <p className="text-xs text-muted-foreground">Aktifkan transisi dan animasi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "profil" && (
              <div className="glass-card p-5 space-y-5 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profil Pengguna
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Ahmad Fadhil</p>
                    <p className="text-sm text-muted-foreground">Pro Plan · Bergabung Maret 2024</p>
                    <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px] mt-1">Pro Member</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs shrink-0">Ubah Foto</Button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Nama Lengkap", value: "Ahmad Fadhil", type: "text" },
                    { label: "Email", value: "fadhil@exabot.ai", type: "email" },
                    { label: "Username", value: "@fadhil_exabot", type: "text" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
                      <Input defaultValue={f.value} type={f.type} className="h-9 bg-secondary/50 border-border/50" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "notifikasi" && (
              <div className="glass-card p-5 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Preferensi Notifikasi
                </h3>
                {[
                  { label: "Notifikasi Push", desc: "Terima notifikasi real-time di browser", on: true },
                  { label: "Alert AI Prediksi Baru", desc: "Notifikasi saat ada prediksi dengan confidence tinggi", on: true },
                  { label: "Peringatan API Limit", desc: "Alert saat API key mendekati batas penggunaan", on: true },
                  { label: "Update Model AI", desc: "Notifikasi saat model selesai training", on: false },
                  { label: "Laporan Performa Mingguan", desc: "Ringkasan performa dikirim via email setiap Senin", on: true },
                  { label: "Suara Notifikasi", desc: "Putar suara saat ada notifikasi baru", on: false },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    <Switch defaultChecked={t.on} />
                  </div>
                ))}
              </div>
            )}

            {activeSection === "sistem" && (
              <div className="glass-card p-5 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Konfigurasi Sistem
                </h3>
                {[
                  { label: "Auto-refresh Data", desc: "Perbarui data pasar otomatis setiap 30 detik", on: true },
                  { label: "Mode Hemat Data", desc: "Kurangi frekuensi update untuk koneksi lambat", on: false },
                  { label: "Debug Mode", desc: "Tampilkan log teknis di konsol browser", on: false },
                  { label: "Telemetri Anonim", desc: "Bantu kami tingkatkan produk dengan data penggunaan anonim", on: true },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    <Switch defaultChecked={t.on} />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Ekspor Data
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Cache
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "keamanan" && (
              <div className="glass-card p-5 space-y-5 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Keamanan Akun
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Password Saat Ini</label>
                    <Input type="password" placeholder="••••••••" className="h-9 bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Password Baru</label>
                    <Input type="password" placeholder="Minimal 8 karakter" className="h-9 bg-secondary/50 border-border/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Konfirmasi Password Baru</label>
                    <Input type="password" placeholder="Ulangi password baru" className="h-9 bg-secondary/50 border-border/50" />
                  </div>
                  <Button size="sm" className="text-xs mt-2">Perbarui Password</Button>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">Autentikasi Dua Faktor</p>
                      <p className="text-xs text-muted-foreground">Tambahkan lapisan keamanan ekstra</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="pt-3 border-t border-destructive/20">
                  <p className="text-sm font-semibold text-destructive mb-2">Zona Bahaya</p>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Akun
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
