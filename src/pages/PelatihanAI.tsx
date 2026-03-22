import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, Clock, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const perfData = [
  { epoch: "1", akurasi: 52 }, { epoch: "5", akurasi: 61 }, { epoch: "10", akurasi: 68 },
  { epoch: "15", akurasi: 74 }, { epoch: "20", akurasi: 78 }, { epoch: "25", akurasi: 82 },
  { epoch: "30", akurasi: 85 }, { epoch: "35", akurasi: 87 },
];

const trainings = [
  { name: "Dataset Politik Q1 2025", status: "selesai", progress: 100, akurasi: "87.3%" },
  { name: "Dataset Kripto Historis", status: "berjalan", progress: 67, akurasi: "74.1%" },
  { name: "Dataset Ekonomi Global", status: "antrian", progress: 0, akurasi: "-" },
];

export default function PelatihanAI() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pusat Pelatihan AI</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola dan pantau proses training model AI</p>
        </div>

        {/* Upload */}
        <div className="glass-card p-8 border-2 border-dashed border-border/50 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Upload Dataset Baru</p>
          <p className="text-sm text-muted-foreground mt-1">Seret file CSV/JSON atau klik untuk memilih</p>
          <Button variant="outline" className="mt-4">Pilih File</Button>
        </div>

        {/* Training list */}
        <div className="space-y-3">
          {trainings.map((t, i) => (
            <div key={i} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{t.name}</h3>
                  <Badge variant={t.status === "selesai" ? "default" : t.status === "berjalan" ? "secondary" : "outline"} className="text-xs">
                    {t.status === "selesai" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {t.status === "berjalan" && <Zap className="w-3 h-3 mr-1" />}
                    {t.status === "antrian" && <Clock className="w-3 h-3 mr-1" />}
                    {t.status}
                  </Badge>
                </div>
                <Progress value={t.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Progress: {t.progress}% • Akurasi: {t.akurasi}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Perf chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Peningkatan Performa Training</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="epoch" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Epoch", position: "insideBottom", offset: -5 }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="akurasi" stroke="hsl(142,76%,36%)" strokeWidth={2} dot={{ fill: "hsl(142,76%,36%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
