import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const markets = [
  { id: 1, name: "Pemilu Presiden AS 2028", yes: 0.62, no: 0.38, volume: "12.4M", change: 3.2, category: "Politik" },
  { id: 2, name: "Bitcoin > $150k EOY", yes: 0.28, no: 0.72, volume: "8.7M", change: -1.5, category: "Kripto" },
  { id: 3, name: "Fed Rate 3% Q4", yes: 0.71, no: 0.29, volume: "5.2M", change: 5.8, category: "Ekonomi" },
  { id: 4, name: "SpaceX IPO 2025", yes: 0.15, no: 0.85, volume: "3.1M", change: 0.8, category: "Teknologi" },
  { id: 5, name: "Indonesia IHSG > 8000", yes: 0.55, no: 0.45, volume: "1.8M", change: -2.1, category: "Saham" },
  { id: 6, name: "AI Regulation EU Passed", yes: 0.82, no: 0.18, volume: "4.5M", change: 1.2, category: "Regulasi" },
  { id: 7, name: "Harga Emas > $3000", yes: 0.45, no: 0.55, volume: "6.3M", change: 4.1, category: "Komoditas" },
  { id: 8, name: "Apple Car Announcement", yes: 0.08, no: 0.92, volume: "2.9M", change: -0.5, category: "Teknologi" },
];

export default function DataPasar() {
  const [search, setSearch] = useState("");
  const filtered = markets.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Data Pasar</h1>
          <p className="text-muted-foreground text-sm mt-1">Jelajahi semua event prediksi yang tersedia</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari event..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Event</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Kategori</th>
                  <th className="text-center py-3 px-4 font-medium text-success">YES</th>
                  <th className="text-center py-3 px-4 font-medium text-destructive">NO</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Volume</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                    <td className="py-3 px-4 font-medium">{m.name}</td>
                    <td className="text-center py-3 px-4"><Badge variant="secondary" className="text-xs">{m.category}</Badge></td>
                    <td className="text-center py-3 px-4 text-success font-semibold">${(m.yes * 100).toFixed(0)}¢</td>
                    <td className="text-center py-3 px-4 text-destructive font-semibold">${(m.no * 100).toFixed(0)}¢</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{m.volume}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-medium ${m.change >= 0 ? "text-success" : "text-destructive"}`}>
                        {m.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.change > 0 ? "+" : ""}{m.change}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
