import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown, Filter, SlidersHorizontal, ArrowUpDown, Star, ExternalLink } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useExabotWebSocketChannel } from "@/hooks/useExabotWebSocket";
import { formatUsdShort, toNum } from "@/lib/format";
import { toast } from "sonner";

type MarketRow = {
  id: string;
  name: string;
  yes_price: string | number;
  no_price: string | number;
  volume_usd: string | number;
  change_24h: string | number;
  is_trending: boolean;
  category: string;
};

type MarketList = { items: MarketRow[]; total: number };
type CategoriesResp = { items: string[] };

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
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<"volume_usd" | "change_24h" | "yes_price">("volume_usd");
  const [watchSet, setWatchSet] = useState<Set<string>>(new Set());

  const onWs = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["markets"] });
  }, [qc]);
  useExabotWebSocketChannel("market", onWs);

  const categoriesQ = useQuery({
    queryKey: ["markets", "categories"],
    queryFn: () => apiFetch<CategoriesResp>("/markets/categories"),
    staleTime: 120_000,
  });

  const categoryTabs = useMemo(() => ["Semua", ...(categoriesQ.data?.items ?? [])], [categoriesQ.data?.items]);

  const marketsQ = useQuery({
    queryKey: ["markets", debouncedSearch, activeCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "50",
        page: "1",
        sort_by: sortBy,
        order: "desc",
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (activeCategory !== "Semua") params.set("category", activeCategory);
      return apiFetch<MarketList>(`/markets?${params.toString()}`);
    },
    refetchInterval: 60_000,
  });

  const toggleWatch = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      if (on) {
        await apiFetch(`/markets/${id}/watch`, { method: "POST" });
      } else {
        await apiFetch(`/markets/${id}/watch`, { method: "DELETE" });
      }
    },
    onMutate: async ({ id, on }) => {
      setWatchSet((prev) => {
        const n = new Set(prev);
        if (on) n.add(id);
        else n.delete(id);
        return n;
      });
    },
    onError: (err: unknown, { id, on }) => {
      setWatchSet((prev) => {
        const n = new Set(prev);
        if (on) n.delete(id);
        else n.add(id);
        return n;
      });
      const msg = err instanceof ApiError ? err.body || err.message : "Gagal memperbarui watchlist";
      toast.error(msg);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["markets"] }),
  });

  const items = marketsQ.data?.items ?? [];

  const sortedLocal = useMemo(() => {
    const copy = [...items];
    if (sortBy === "yes_price") {
      copy.sort((a, b) => toNum(b.yes_price) - toNum(a.yes_price));
    }
    return copy;
  }, [items, sortBy]);

  const totalVol = useMemo(() => {
    return sortedLocal.reduce((s, m) => s + toNum(m.volume_usd), 0);
  }, [sortedLocal]);

  const trendingN = sortedLocal.filter((m) => m.is_trending).length;

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Pasar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {marketsQ.data?.total ?? sortedLocal.length} event · {marketsQ.isFetching ? "Memperbarui…" : "REST + WebSocket"}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => marketsQ.refetch()}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Event", value: String(marketsQ.data?.total ?? "—"), sub: "halaman ini" },
            { label: "Volume (subset)", value: `$${formatUsdShort(totalVol)}`, sub: "50 baris" },
            { label: "Trending", value: String(trendingN), sub: "event hot" },
            { label: "Watchlist lokal", value: String(watchSet.size), sub: "session" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className="text-lg font-bold mt-0.5">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

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
              { key: "volume_usd" as const, label: "Volume" },
              { key: "change_24h" as const, label: "Perubahan" },
              { key: "yes_price" as const, label: "YES" },
            ].map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSortBy(s.key)}
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

        <div className="flex gap-2 flex-wrap">
          {categoriesQ.isError && (
            <p className="text-xs text-destructive w-full">Gagal memuat kategori — filter hanya &quot;Semua&quot;.</p>
          )}
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              type="button"
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
                    <div className="flex items-center justify-center gap-1">
                      Volume <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-center">Perubahan</th>
                  <th className="text-center">AI Edge</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {marketsQ.isLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      Memuat pasar…
                    </td>
                  </tr>
                )}
                {marketsQ.isError && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-destructive">
                      Gagal memuat data pasar.
                    </td>
                  </tr>
                )}
                {!marketsQ.isLoading &&
                  sortedLocal.map((m, idx) => {
                    const yes = toNum(m.yes_price);
                    const no = toNum(m.no_price);
                    const ch = toNum(m.change_24h);
                    const vol = toNum(m.volume_usd);
                    const watched = watchSet.has(m.id);
                    return (
                      <tr
                        key={m.id}
                        className="cursor-pointer group animate-fade-in"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <td className="pl-4 pr-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatch.mutate({ id: m.id, on: !watched });
                            }}
                            className="transition-colors"
                            aria-label="Toggle watchlist"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${watched ? "fill-warning text-warning" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                            />
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{m.name}</span>
                            {m.is_trending && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                HOT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              categoryColors[m.category] || "bg-secondary/50 text-muted-foreground border-border/50"
                            }`}
                          >
                            {m.category}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="font-bold text-success">{(yes * 100).toFixed(0)}¢</span>
                        </td>
                        <td className="text-center">
                          <span className="font-bold text-destructive">{(no * 100).toFixed(0)}¢</span>
                        </td>
                        <td className="text-center text-muted-foreground text-xs">${formatUsdShort(vol)}</td>
                        <td className="text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              ch >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {ch >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {ch > 0 ? "+" : ""}
                            {ch.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center text-xs text-muted-foreground">—</td>
                        <td className="pr-4">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!marketsQ.isLoading && sortedLocal.length === 0 && (
            <div className="py-16 text-center">
              <Filter className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Tidak ada event</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Sesuaikan filter atau jalankan ingestion backend</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
