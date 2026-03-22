import { DashboardLayout } from "@/components/DashboardLayout";
import { Brain, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const sentimentData = [
  { name: "Positif", value: 62, color: "hsl(142,76%,36%)" },
  { name: "Negatif", value: 25, color: "hsl(0,84%,60%)" },
  { name: "Netral", value: 13, color: "hsl(38,92%,50%)" },
];

const factorData = [
  { faktor: "Sentimen Media", skor: 85 },
  { faktor: "Data Ekonomi", skor: 72 },
  { faktor: "Pola Historis", skor: 68 },
  { faktor: "Volume Pasar", skor: 91 },
  { faktor: "Indikator Teknis", skor: 76 },
];

export default function AnalisisAI() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analisis AI</h1>
          <p className="text-muted-foreground text-sm mt-1">Pemahaman mendalam dari reasoning AI</p>
        </div>

        {/* AI Reasoning Panel */}
        <div className="glass-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Reasoning AI — Fed Rate Cut Analysis</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>Berdasarkan analisis multi-faktor, model AI memprediksi probabilitas 82% untuk pemotongan suku bunga Fed di Q2 2025.</p>
            <p>Data inflasi menunjukkan tren penurunan selama 3 bulan berturut-turut. Pasar tenaga kerja mulai menunjukkan pelambatan yang signifikan.</p>
            <p>Sentimen pasar obligasi mendukung ekspektasi pelonggaran kebijakan moneter dalam waktu dekat.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sentiment */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Analisis Sentimen</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {sentimentData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.name} ({s.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factor scores */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Skor Faktor Analisis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={factorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="faktor" type="category" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="skor" fill="hsl(187,96%,42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold">Faktor Pendukung</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ThumbsUp className="w-4 h-4 text-success shrink-0 mt-0.5" /> Inflasi CPI turun 3 bulan berturut-turut</li>
              <li className="flex items-start gap-2"><ThumbsUp className="w-4 h-4 text-success shrink-0 mt-0.5" /> Komentar dovish dari anggota FOMC</li>
              <li className="flex items-start gap-2"><ThumbsUp className="w-4 h-4 text-success shrink-0 mt-0.5" /> Yield obligasi 10 tahun menurun signifikan</li>
              <li className="flex items-start gap-2"><ThumbsUp className="w-4 h-4 text-success shrink-0 mt-0.5" /> Data pengangguran meningkat tipis</li>
            </ul>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold">Faktor Risiko</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ThumbsDown className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> Harga energi masih volatil</li>
              <li className="flex items-start gap-2"><ThumbsDown className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> Ketegangan geopolitik meningkat</li>
              <li className="flex items-start gap-2"><ThumbsDown className="w-4 h-4 text-destructive shrink-0 mt-0.5" /> Core inflation masih di atas target 2%</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
