import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown, Filter, SlidersHorizontal, ArrowUpDown, Star, ExternalLink } from "lucide-react";
import { useState } from "react";

const markets = [
  { id: 1, name: "Pemilu Presiden AS 2028", yes: 0.62, no: 0.38, volume: "12.4M", change: 3.2, category: "Politik", trending: true, aiEdge: 8 },
  { id: 2, name: "Bitcoin > $150k EOY 2025", yes: 0.28, no: 0.72, volume: "8.7M", change: -1.5, category: "Kripto", trending: false, aiEdge: -12 },
  { id: 3, name: "Fed Rate 3.0% Q4 2025", yes: 0.71, no: 0.29, volume: "5.2M", change: 5.8, category: "Ekonomi", trending: true, aiEdge: 15 },
  { id: 4, name: "SpaceX IPO Terjadi 2025", yes: 0.15, no: 0.85, volume: "3.1M", change: 0.8, category: "Teknologi", trending: false, aiEdge: -4 },
  { id: 5, name: "Indonesia IHSG > 8.000", yes: 0.55, no: 0.45, volume: "1.8M", change: -2.1, category: "Saham", trending: false, aiEdge: 11 },
  { id: 6, name: "AI Regulation EU Disahkan", yes: 0.82, no: 0.18, volume: "4.5M", change: 1.2, category: "Regulasi", trending: true, aiEdge: 6 },
  { id: 7, name: "Harga Emas > $3.000/oz", yes: 0.45, no: 0.55, volume: "6.3M", change: 4.1, category: "Komoditas", trending: true, aiEdge: 19 },
  { id: 8, name: "Apple Car Diumumkan 2025", yes: 0.08, no: 0.92, volume: "2.9M", change: -0.5, category: "Teknologi", trending: false, aiEdge: -3 },
  { id: 9, name: "Ethereum Melampaui $10.000", yes: 0.33, no: 0.67, volume: "7.1M", change: 2.4, category: "Kripto", trending: false, aiEdge: 7 },
  { id: 10, name: "Inflasi AS Turun < 2%", yes: 0.64, no: 0.36, volume: "3.8M", change: 1.9, category: "Ekonomi", trending: false, aiEdge: 13 },
  { id: 11, name: "NVIDIA Tetap #1 AI Chip", yes: 0.88, no: 0.12, volume: "9.2M", change: 0.3, category: "Teknologi", trending: true, aiEdge: 4 },
  { id: 12, name: "G20 Sepakati Climate Deal", yes: 0.42, no: 0.58, volume: "1.4M", change: -0.8, category: "Politik", trending: false, aiEdge: -9 },
];

const categories = ["Semua", "Politik", "Kripto", "Ekonomi", "Teknologi", "Saham", "Komoditas", "Regulasi"];

const categoryColors: Record<string, string> = {
  Politik: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Kripto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Ekonomi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Teknologi: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Saham: "bg-green-500/10 text-green-400 border-green-500/20",
  Komoditas: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Regulasi: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function DataPasar() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "aiEdge">("volume");
  const [watchlist, setWatchlist] = useState<number[]>([1, 3, 7]);

  const filtered = markets
    .filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "Semua" || m.category === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "volume") return parseFloat(b.volume) - parseFloat(a.volume);
      if (sortBy === "change") return b.change - a.change;
      if (sortBy === "aiEdge") return Math.abs(b.aiEdge) - Math.abs(a.aiEdge);
      return 0;
    });

  const toggleWatchlist = (id: number) => {
    setWatchlist((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Pasar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} event tersedia · Diperbarui setiap 5 menit
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter Lanjutan
          </Button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Event", value: `${markets.length}`, sub: "aktif" },
            { label: "Volume Total", value: "$76.4M", sub: "24 jam" },
            { label: "AI Edge Terbaik", value: "+19%", sub: "Emas > $3k" },
            { label: "Trending", value: `${markets.filter(m => m.trending).length}`, sub: "event hot" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-bold mt-0.5">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari event pasar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Urutkan:</span>
            {[
              { key: "volume", label: "Volume" },
              { key: "change", label: "Perubahan" },
              { key: "aiEdge", label: "AI Edge" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  sortBy === s.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-secondary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th>Event</th>
                  <th className="text-center">Kategori</th>
                  <th className="text-center text-success">YES</th>
                  <th className="text-center text-destructive">NO</th>
                  <th className="text-center">
                    <div className="flex items-center justify-center gap-1">Volume <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="text-center">Perubahan</th>
                  <th className="text-center">AI Edge</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="pl-4 pr-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(m.id); }}
                        className="transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${watchlist.includes(m.id) ? "fill-warning text-warning" : "text-muted-foreground/40 hover:text-muted-foreground"}`} />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        {m.trending && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">HOT</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${categoryColors[m.category] || ""}`}>
                        {m.category}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="font-bold text-success">{(m.yes * 100).toFixed(0)}¢</span>
                    </td>
                    <td className="text-center">
                      <span className="font-bold text-destructive">{(m.no * 100).toFixed(0)}¢</span>
                    </td>
                    <td className="text-center text-muted-foreground text-xs">${m.volume}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${m.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {m.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.change > 0 ? "+" : ""}{m.change}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`text-xs font-bold ${Math.abs(m.aiEdge) >= 10 ? (m.aiEdge > 0 ? "text-success" : "text-destructive") : "text-muted-foreground"}`}>
                        {m.aiEdge > 0 ? "+" : ""}{m.aiEdge}%
                      </span>
                    </td>
                    <td className="pr-4">
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Filter className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Tidak ada event yang cocok</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
