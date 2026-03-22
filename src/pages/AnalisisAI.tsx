import { DashboardLayout } from "@/components/DashboardLayout";
import { Brain, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, Sparkles, Target, BarChart2, Globe, TrendingUp } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const sentimentData = [
  { name: "Positif", value: 62, color: "hsl(142,76%,42%)" },
  { name: "Negatif", value: 25, color: "hsl(0,72%,51%)" },
  { name: "Netral", value: 13, color: "hsl(38,92%,55%)" },
];

const factorData = [
  { faktor: "Sentimen Media", skor: 85 },
  { faktor: "Data Ekonomi", skor: 72 },
  { faktor: "Pola Historis", skor: 68 },
  { faktor: "Volume Pasar", skor: 91 },
  { faktor: "Indikator Teknis", skor: 76 },
  { faktor: "Geopolitik", skor: 58 },
];

const radarData = [
  { subject: "Akurasi", A: 87 },
  { subject: "Confidence", A: 83 },
  { subject: "Kecepatan", A: 95 },
  { subject: "Konsistensi", A: 78 },
  { subject: "Coverage", A: 72 },
  { subject: "Presisi", A: 89 },
];

const newsData = [
  { source: "Reuters", title: "Fed Signals Potential Rate Cuts Amid Cooling Inflation", sentiment: "positif", score: 0.78, time: "2 jam lalu" },
  { source: "Bloomberg", title: "US Job Market Shows Signs of Softening in Latest Report", sentiment: "netral", score: 0.52, time: "4 jam lalu" },
  { source: "CNBC", title: "Treasury Yields Drop as Investors Bet on Policy Easing", sentiment: "positif", score: 0.81, time: "5 jam lalu" },
  { source: "WSJ", title: "Oil Prices Surge on Middle East Tension Concerns", sentiment: "negatif", score: 0.65, time: "6 jam lalu" },
];

const events = [
  { name: "Fed Rate Cut Q2 2025", prob: 82, change: "+7%", kategori: "Ekonomi" },
  { name: "Harga Emas > $2.800", prob: 88, change: "+3%", kategori: "Komoditas" },
  { name: "Bitcoin > $120k", prob: 34, change: "-8%", kategori: "Kripto" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function AnalisisAI() {
  const [activeEvent, setActiveEvent] = useState(0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisis AI</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pemahaman mendalam dari reasoning dan analisis model ExaBot</p>
        </div>

        {/* Event Selector */}
        <div className="flex gap-2 flex-wrap">
          {events.map((e, i) => (
            <button
              key={i}
              onClick={() => setActiveEvent(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeEvent === i
                  ? "bg-primary/10 text-primary border-primary/30 neon-glow"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{e.name}</span>
              <span className={`text-xs font-bold ${activeEvent === i ? "text-primary" : "text-muted-foreground"}`}>
                {e.prob}%
              </span>
            </button>
          ))}
        </div>

        {/* AI Reasoning Panel */}
        <div className="glass-card p-5 border-l-4 border-l-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex items-start gap-3 relative">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-sm">Reasoning AI — {events[activeEvent].name}</h3>
                <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px]">
                  Probabilitas: {events[activeEvent].prob}%
                </Badge>
                <Badge className="bg-success/10 text-success border-success/20 border text-[10px]">
                  <TrendingUp className="w-2.5 h-2.5 mr-1" />
                  {events[activeEvent].change} minggu ini
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Berdasarkan analisis multi-faktor oleh model Ensemble v3.2, ExaBot memprediksi probabilitas
                  <span className="text-primary font-semibold mx-1">{events[activeEvent].prob}%</span>
                  untuk event ini.
                </p>
                <p>
                  Data inflasi menunjukkan tren penurunan selama 3 bulan berturut-turut ke level 2.8%.
                  Pasar tenaga kerja mulai menunjukkan pelambatan yang signifikan dengan tingkat pengangguran naik ke 4.1%.
                </p>
                <p>
                  Sentimen pasar obligasi sangat mendukung ekspektasi pelonggaran kebijakan moneter.
                  Model BERT sentimen mendeteksi <span className="text-success font-medium">62% sinyal positif</span> dari 847 artikel berita terkini.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sentiment Pie */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-semibold">Analisis Sentimen</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={4} dataKey="value"
                  strokeWidth={0}
                >
                  {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {sentimentData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factor Bar */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold">Skor Faktor Analisis</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={factorData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="faktor" type="category" width={115} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="skor" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {factorData.map((entry, i) => (
                    <Cell key={i} fill={entry.skor >= 80 ? "hsl(187,96%,48%)" : entry.skor >= 65 ? "hsl(217,91%,60%)" : "hsl(262,83%,65%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supporting/Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-success/10">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-semibold">Faktor Pendukung</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Inflasi CPI turun 3 bulan berturut-turut ke 2.8%",
                "Pernyataan dovish dari 4 anggota FOMC",
                "Yield obligasi 10 tahun turun ke 4.1%",
                "Data pengangguran naik tipis ke 4.1%",
                "Sentimen pasar obligasi sangat positif",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <ThumbsUp className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-sm font-semibold">Faktor Risiko</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Harga energi masih volatile, bisa dorong inflasi",
                "Ketegangan geopolitik Timur Tengah meningkat",
                "Core inflation masih di atas target 2%",
                "Partai oposisi menentang pemotongan suku bunga",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <ThumbsDown className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* News Sources */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sumber Berita Relevan</h3>
            <Badge variant="secondary" className="text-[10px] ml-auto">{newsData.length} artikel</Badge>
          </div>
          <div className="divide-y divide-border/30">
            {newsData.map((news, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-secondary/20 transition-colors cursor-pointer">
                <div className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                  news.sentiment === "positif" ? "bg-success/10 text-success" :
                  news.sentiment === "negatif" ? "bg-destructive/10 text-destructive" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {news.source}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{news.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${news.sentiment === "positif" ? "text-success" : news.sentiment === "negatif" ? "text-destructive" : "text-warning"}`}>
                      {news.sentiment} ({(news.score * 100).toFixed(0)}%)
                    </span>
                    <span className="text-xs text-muted-foreground">· {news.time}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="text-xs text-muted-foreground text-right">Skor</div>
                  <div className={`text-sm font-bold ${news.score >= 0.7 ? "text-success" : "text-warning"}`}>
                    {(news.score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
