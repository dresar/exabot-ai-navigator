import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Key, Plus, RotateCcw, Copy } from "lucide-react";

const keys = [
  { name: "Polymarket API", key: "pk_live_****7f3a", status: "aktif", usage: 72, limit: "10,000/hari" },
  { name: "OpenAI GPT-4", key: "sk-****9x2b", status: "aktif", usage: 45, limit: "5,000/hari" },
  { name: "News API", key: "na_****4k1m", status: "limit", usage: 98, limit: "1,000/hari" },
  { name: "Twitter/X API", key: "tw_****8p3q", status: "aktif", usage: 23, limit: "15,000/hari" },
];

export default function ManajemenAPIKey() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manajemen API Key</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola API key untuk integrasi eksternal</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Tambah Key</Button>
        </div>
        <div className="space-y-3">
          {keys.map((k, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Key className="w-4 h-4 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-sm">{k.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{k.key}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={k.status === "aktif" ? "default" : "destructive"} className="text-xs">{k.status}</Badge>
                  <Button variant="outline" size="sm" className="gap-1 text-xs"><RotateCcw className="w-3 h-3" /> Rotasi</Button>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Penggunaan: {k.limit}</span>
                  <span className="font-medium">{k.usage}%</span>
                </div>
                <Progress value={k.usage} className={`h-2 ${k.usage > 90 ? "[&>div]:bg-destructive" : ""}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
