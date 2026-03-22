import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowRight, Zap } from "lucide-react";

const strategies = [
  {
    name: "Strategi High Confidence",
    conditions: [
      { if: "Confidence AI > 85%", then: "Pasang posisi YES" },
      { if: "Selisih AI-Market > 15%", then: "Tingkatkan ukuran bet" },
    ],
    active: true,
  },
  {
    name: "Strategi Konservatif",
    conditions: [
      { if: "Brier Score < 0.2", then: "Aktifkan auto-bet" },
      { if: "Risiko > 70%", then: "Skip prediksi" },
    ],
    active: false,
  },
];

export default function PembuatStrategi() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pembuat Strategi</h1>
            <p className="text-muted-foreground text-sm mt-1">Buat aturan otomatis untuk prediksi AI</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Strategi Baru</Button>
        </div>

        {strategies.map((s, i) => (
          <div key={i} className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <h3 className="font-semibold">{s.name}</h3>
              </div>
              <Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Aktif" : "Nonaktif"}</Badge>
            </div>
            <div className="space-y-2">
              {s.conditions.map((c, j) => (
                <div key={j} className="flex items-center gap-3 flex-wrap bg-secondary/30 rounded-lg p-3">
                  <Badge variant="outline" className="text-xs">JIKA</Badge>
                  <span className="text-sm font-medium">{c.if}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">MAKA</Badge>
                  <span className="text-sm font-medium text-primary">{c.then}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Builder */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold">Tambah Kondisi Baru</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">JIKA</Badge>
            <Select>
              <SelectTrigger className="w-48"><SelectValue placeholder="Pilih parameter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="confidence">Confidence AI</SelectItem>
                <SelectItem value="diff">Selisih AI-Market</SelectItem>
                <SelectItem value="brier">Brier Score</SelectItem>
                <SelectItem value="risk">Skor Risiko</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-24"><SelectValue placeholder="Operator" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gt">&gt;</SelectItem>
                <SelectItem value="lt">&lt;</SelectItem>
                <SelectItem value="eq">=</SelectItem>
              </SelectContent>
            </Select>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">MAKA</Badge>
            <Select>
              <SelectTrigger className="w-48"><SelectValue placeholder="Pilih aksi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bet-yes">Pasang YES</SelectItem>
                <SelectItem value="bet-no">Pasang NO</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
                <SelectItem value="alert">Kirim Alert</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">Tambah</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
