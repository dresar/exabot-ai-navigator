import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, Zap, TrendingUp, TrendingDown, Clock, CheckCircle2, ArrowUpRight, BarChart2 } from "lucide-react";
import { useState } from "react";

const predictions = [
  {
    id: 1,
    event: "Bitcoin melewati $120k sebelum Juni 2025",
    aiProb: 34, marketProb: 45, confidence: 78, status: "pending",
    kategori: "Kripto", lastUpdate: "2 menit lalu", volume: "8.4M",
  },
  {
    id: 2,
    event: "Fed menurunkan suku bunga di Q2 2025",
    aiProb: 82, marketProb: 75, confidence: 91, status: "pending",
    kategori: "Ekonomi", lastUpdate: "5 menit lalu", volume: "12.1M",
  },
  {
    id: 3,
    event: "Tesla mencapai $400 per saham Q3 2025",
    aiProb: 28, marketProb: 32, confidence: 65, status: "pending",
    kategori: "Saham", lastUpdate: "8 menit lalu", volume: "4.2M",
  },
  {
    id: 4,
    event: "Indonesia GDP growth > 5.5% di 2025",
    aiProb: 67, marketProb: 55, confidence: 84, status: "selesai",
    kategori: "Ekonomi", lastUpdate: "1 jam lalu", volume: "2.1M",
  },
  {
    id: 5,
    event: "Apple merilis AR Glasses 2025",
    aiProb: 55, marketProb: 48, confidence: 72, status: "pending",
    kategori: "Teknologi", lastUpdate: "12 menit lalu", volume: "5.8M",
  },
  {
    id: 6,
    event: "Harga emas melampaui $2.800/oz",
    aiProb: 88, marketProb: 79, confidence: 93, status: "selesai",
    kategori: "Komoditas", lastUpdate: "30 menit lalu", volume: "9.3M",
  },
  {
    id: 7,
    event: "Pemilu Presiden Indonesia 2029 - PDI-P menang",
    aiProb: 43, marketProb: 38, confidence: 61, status: "pending",
    kategori: "Politik", lastUpdate: "45 menit lalu", volume: "1.7M",
  },
  {
    id: 8,
    event: "OpenAI merilis GPT-5 sebelum Juli 2025",
    aiProb: 71, marketProb: 64, confidence: 80, status: "pending",
    kategori: "Teknologi", lastUpdate: "3 menit lalu", volume: "7.6M",
  },
  {
    id: 9,
    event: "SpaceX berhasil landing di Mars",
    aiProb: 12, marketProb: 18, confidence: 55, status: "pending",
    kategori: "Sains", lastUpdate: "1 jam lalu", volume: "3.2M",
  },
];

const categories = ["Semua", "Kripto", "Ekonomi", "Saham", "Teknologi", "Komoditas", "Politik", "Sains"];

const categoryColors: Record<string, string> = {
  Kripto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Ekonomi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Saham: "bg-green-500/10 text-green-400 border-green-500/20",
  Teknologi: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Komoditas: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Politik: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Sains: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function PrediksiLangsung() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = activeCategory === "Semua" ? predictions : predictions.filter(p => p.kategori === activeCategory);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">Prediksi Langsung</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold text-success">Live</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} prediksi aktif · Diperbarui secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleRefresh}>
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground bg-secondary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, idx) => {
            const diff = p.aiProb - p.marketProb;
            const signal = diff > 8 ? "positive" : diff < -8 ? "negative" : "neutral";

            return (
              <div
                key={p.id}
                className="glass-card p-5 hover:scale-[1.01] transition-all duration-200 cursor-pointer group space-y-4 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${categoryColors[p.kategori] || "bg-secondary text-muted-foreground border-border"}`}>
                      {p.kategori}
                    </span>
                    <h3 className="font-semibold text-sm leading-snug">{p.event}</h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] flex items-center gap-1 ${
                      p.status === "selesai"
                        ? "bg-secondary text-muted-foreground"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20 border"
                    }`}
                  >
                    {p.status === "pending"
                      ? <><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />Aktif</>
                      : <><CheckCircle2 className="w-2.5 h-2.5" />Selesai</>
                    }
                  </Badge>
                </div>

                {/* Probability grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-primary/8 border border-primary/15 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">EXABOT AI</p>
                    <p className="text-2xl font-bold text-primary leading-none">{p.aiProb}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">probabilitas YES</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary border border-border/50 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">MARKET</p>
                    <p className="text-2xl font-bold leading-none">{p.marketProb}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">probabilitas YES</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Confidence AI</span>
                    <span className={`font-semibold ${p.confidence >= 85 ? "text-success" : p.confidence >= 70 ? "text-warning" : "text-destructive"}`}>
                      {p.confidence}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${p.confidence >= 85 ? "bg-success" : p.confidence >= 70 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${p.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Signal & meta */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div className={`flex items-center gap-1 text-xs font-semibold ${
                    signal === "positive" ? "text-success" : signal === "negative" ? "text-destructive" : "text-warning"
                  }`}>
                    {signal === "positive"
                      ? <><TrendingUp className="w-3.5 h-3.5" />AI lebih optimis ({diff > 0 ? "+" : ""}{diff}%)</>
                      : signal === "negative"
                      ? <><TrendingDown className="w-3.5 h-3.5" />AI lebih pesimis ({diff}%)</>
                      : <><BarChart2 className="w-3.5 h-3.5" />Selisih kecil</>
                    }
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {p.lastUpdate}
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground -mt-2">
                  <span>Vol: ${p.volume}</span>
                  <button className="flex items-center gap-0.5 text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Detail <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
