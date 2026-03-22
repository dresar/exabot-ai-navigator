import { DashboardLayout } from "@/components/DashboardLayout";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function ManajemenRisiko() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Risiko</h1>
          <p className="text-muted-foreground text-sm mt-1">Atur batasan dan parameter risiko</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-warning">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Perhatian</span>
          </div>
          <p className="text-sm text-muted-foreground">Pastikan parameter risiko disesuaikan dengan profil toleransi Anda. Pengaturan terlalu agresif dapat meningkatkan potensi kerugian.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Limit Risiko</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Maksimum loss per hari</span><span className="font-medium">Rp 50.000</span></div>
                <Slider defaultValue={[50]} max={200} step={10} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Maksimum bet per event</span><span className="font-medium">Rp 25.000</span></div>
                <Slider defaultValue={[25]} max={100} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Confidence minimum</span><span className="font-medium">70%</span></div>
                <Slider defaultValue={[70]} max={100} step={5} />
              </div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-5">
            <h3 className="font-semibold">Alokasi Modal</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Politik</span><span className="font-medium">30%</span></div>
                <Slider defaultValue={[30]} max={100} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Ekonomi</span><span className="font-medium">40%</span></div>
                <Slider defaultValue={[40]} max={100} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Kripto</span><span className="font-medium">15%</span></div>
                <Slider defaultValue={[15]} max={100} step={5} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span>Lainnya</span><span className="font-medium">15%</span></div>
                <Slider defaultValue={[15]} max={100} step={5} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">Toggle Keamanan</h3>
          <div className="space-y-3">
            {[
              { label: "Stop-loss otomatis", desc: "Hentikan trading jika loss melebihi limit harian", on: true },
              { label: "Notifikasi risiko tinggi", desc: "Kirim alert saat confidence di bawah threshold", on: true },
              { label: "Mode konservatif", desc: "Hanya eksekusi prediksi dengan confidence > 85%", on: false },
              { label: "Anti-martingale", desc: "Kurangi ukuran bet setelah kalah berturut-turut", on: true },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
                <Switch defaultChecked={t.on} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
