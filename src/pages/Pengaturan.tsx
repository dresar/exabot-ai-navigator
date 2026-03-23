import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, Bell, Shield, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

const sections = [
  { id: "tampilan", label: "Tampilan", icon: Palette },
  { id: "profil", label: "Profil", icon: User },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "keamanan", label: "Keamanan", icon: Shield },
];

type UserSettings = {
  theme: string;
  language: string;
  density: string;
  animations_enabled: boolean;
  auto_refresh: boolean;
  push_notifications: boolean;
  debug_mode: boolean;
  two_factor_enabled: boolean;
};

export default function Pengaturan() {
  const { theme, setTheme } = useTheme();
  const { data: me } = useCurrentUser();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState("tampilan");
  const [form, setForm] = useState<Partial<UserSettings>>({});
  const [profileEmail, setProfileEmail] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const settingsQ = useQuery({
    queryKey: ["users", "me", "settings"],
    queryFn: () => apiFetch<UserSettings>("/users/me/settings"),
  });

  useEffect(() => {
    if (settingsQ.data) {
      setForm(settingsQ.data);
      if (settingsQ.data.theme === "dark" || settingsQ.data.theme === "light") {
        setTheme(settingsQ.data.theme);
      }
    }
  }, [settingsQ.data, setTheme]);

  useEffect(() => {
    if (me) {
      setProfileEmail(me.email);
      setProfileUsername(me.username);
    }
  }, [me]);

  const saveProfileM = useMutation({
    mutationFn: () =>
      apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          email: profileEmail.trim(),
          username: profileUsername.trim(),
        }),
      }),
    onSuccess: () => {
      toast.success("Profil diperbarui");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan profil"),
  });

  const changePasswordM = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("Password baru minimal 8 karakter");
      if (newPassword !== confirmPassword) throw new Error("Konfirmasi password tidak cocok");
      await apiFetch("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Password diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: unknown) => {
      let msg = "Gagal mengubah password";
      if (e instanceof ApiError && e.body) {
        try {
          const j = JSON.parse(e.body) as { detail?: string };
          if (typeof j.detail === "string") msg = j.detail;
        } catch {
          msg = e.message;
        }
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    },
  });

  const saveM = useMutation({
    mutationFn: () =>
      apiFetch<UserSettings>("/users/me/settings", {
        method: "PUT",
        body: JSON.stringify({
          theme: theme === "dark" ? "dark" : "light",
          language: form.language,
          density: form.density,
          animations_enabled: form.animations_enabled,
          auto_refresh: form.auto_refresh,
          push_notifications: form.push_notifications,
          debug_mode: form.debug_mode,
          two_factor_enabled: form.two_factor_enabled,
        }),
      }),
    onSuccess: () => {
      toast.success("Pengaturan disimpan");
      qc.invalidateQueries({ queryKey: ["users", "me", "settings"] });
    },
    onError: (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Gagal simpan"),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Profil · GET/PUT /users/me · password · GET/PUT /users/me/settings</p>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => saveM.mutate()} disabled={saveM.isPending || settingsQ.isLoading}>
            {saveM.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-52 shrink-0">
            <div className="glass-card p-2 flex flex-row lg:flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
                    activeSection === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <s.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:block">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {activeSection === "tampilan" && (
              <div className="glass-card p-5 space-y-5 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  Tampilan
                </h3>
                {settingsQ.isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-800" : "bg-yellow-50"}`}>
                        {theme === "dark" ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Mode gelap</p>
                        <p className="text-xs text-muted-foreground">Disinkronkan ke pengaturan akun saat simpan</p>
                      </div>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={(on) => setTheme(on ? "dark" : "light")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Bahasa</p>
                    <Select
                      value={form.language ?? "id"}
                      onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}
                    >
                      <SelectTrigger className="w-44 h-9 bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Kepadatan</p>
                    <Select value={form.density ?? "normal"} onValueChange={(v) => setForm((f) => ({ ...f, density: v }))}>
                      <SelectTrigger className="w-44 h-9 bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Kompak</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="comfortable">Nyaman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Animasi</p>
                    <Switch
                      checked={!!form.animations_enabled}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, animations_enabled: v }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "profil" && (
              <div className="glass-card p-5 space-y-5 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profil
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {(profileUsername || me?.username || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{me?.username ?? "—"}</p>
                    <p className="text-sm text-muted-foreground truncate">{me?.email ?? ""}</p>
                    <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px] mt-1">{me?.plan ?? "—"}</Badge>
                  </div>
                </div>
                <div className="space-y-3 max-w-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="profil-email">Email</Label>
                    <Input
                      id="profil-email"
                      type="email"
                      autoComplete="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profil-username">Username</Label>
                    <Input
                      id="profil-username"
                      autoComplete="username"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      className="bg-secondary/40"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={saveProfileM.isPending || !profileEmail.trim() || !profileUsername.trim()}
                    onClick={() => saveProfileM.mutate()}
                  >
                    {saveProfileM.isPending ? "Menyimpan…" : "Simpan profil"}
                  </Button>
                  <p className="text-xs text-muted-foreground">Backend: PUT /api/v1/users/me</p>
                </div>
              </div>
            )}

            {activeSection === "notifikasi" && (
              <div className="glass-card p-5 space-y-4 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Notifikasi
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <div>
                    <p className="text-sm font-medium">Auto refresh data</p>
                    <p className="text-xs text-muted-foreground">Polling ringkasan dashboard</p>
                  </div>
                  <Switch
                    checked={!!form.auto_refresh}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, auto_refresh: v }))}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <div>
                    <p className="text-sm font-medium">Push (preferensi)</p>
                    <p className="text-xs text-muted-foreground">Disimpan di server</p>
                  </div>
                  <Switch
                    checked={!!form.push_notifications}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, push_notifications: v }))}
                  />
                </div>
              </div>
            )}

            {activeSection === "keamanan" && (
              <div className="glass-card p-5 space-y-6 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Keamanan
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Mode debug</p>
                    <p className="text-xs text-muted-foreground">Preferensi tersimpan di pengaturan akun</p>
                  </div>
                  <Switch checked={!!form.debug_mode} onCheckedChange={(v) => setForm((f) => ({ ...f, debug_mode: v }))} />
                </div>
                <div className="border-t border-border/40 pt-5 space-y-3 max-w-md">
                  <p className="text-sm font-medium">Ubah password</p>
                  <p className="text-xs text-muted-foreground">PUT /api/v1/users/me/password — minimal 8 karakter</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="pwd-current">Password saat ini</Label>
                    <Input
                      id="pwd-current"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pwd-new">Password baru</Label>
                    <Input
                      id="pwd-new"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-secondary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pwd-confirm">Konfirmasi password baru</Label>
                    <Input
                      id="pwd-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-secondary/40"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={
                      changePasswordM.isPending || !currentPassword || !newPassword || !confirmPassword
                    }
                    onClick={() => changePasswordM.mutate()}
                  >
                    {changePasswordM.isPending ? "Mengubah…" : "Ubah password"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border/40 pt-4">
                  Autentikasi dua faktor (2FA) belum tersedia di API — tidak ada toggle sampai backend mendukung.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
