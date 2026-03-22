import { DashboardLayout } from "@/components/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Cpu } from "lucide-react";

const models = [
  { name: "Ensemble v3.2", type: "Multi-Model", akurasi: 87.3, status: true, desc: "Model utama gabungan sentimen + statistik" },
  { name: "Sentimen BERT", type: "NLP", akurasi: 81.5, status: true, desc: "Analisis sentimen berbasis transformer" },
  { name: "XGBoost Statistical", type: "ML", akurasi: 79.2, status: false, desc: "Model statistik klasik untuk pola numerik" },
  { name: "LSTM Temporal", type: "Deep Learning", akurasi: 76.8, status: true, desc: "Analisis pola temporal dan time-series" },
  { name: "GPT Reasoning", type: "LLM", akurasi: 84.1, status: true, desc: "Reasoning berbasis large language model" },
];

const compareData = models.map((m) => ({ name: m.name.split(" ")[0], akurasi: m.akurasi }));

export default function ModelAI() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Model AI</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola dan bandingkan performa model AI</p>
        </div>
        <div className="space-y-3">
          {models.map((m, i) => (
            <div key={i} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2 rounded-lg bg-primary/10"><Cpu className="w-5 h-5 text-primary" /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{m.name}</h3>
                  <Badge variant="secondary" className="text-xs">{m.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Akurasi</p>
                  <p className="font-bold text-primary">{m.akurasi}%</p>
                </div>
                <Switch defaultChecked={m.status} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Perbandingan Performa Model</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={compareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="akurasi" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
