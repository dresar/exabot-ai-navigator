import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const predictions = [
  { id: 1, event: "Bitcoin melewati $120k sebelum Juni 2025", aiProb: 34, marketProb: 45, confidence: 78, status: "pending" },
  { id: 2, event: "Fed menurunkan suku bunga di Q2 2025", aiProb: 82, marketProb: 75, confidence: 91, status: "pending" },
  { id: 3, event: "Tesla mencapai $400/saham", aiProb: 28, marketProb: 32, confidence: 65, status: "pending" },
  { id: 4, event: "Indonesia GDP growth > 5.5%", aiProb: 67, marketProb: 55, confidence: 84, status: "selesai" },
  { id: 5, event: "Apple merilis AR Glasses 2025", aiProb: 55, marketProb: 48, confidence: 72, status: "pending" },
  { id: 6, event: "Harga emas > $2500/oz", aiProb: 88, marketProb: 79, confidence: 93, status: "selesai" },
];

export default function PrediksiLangsung() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Prediksi Langsung</h1>
          <p className="text-muted-foreground text-sm mt-1">Pantau prediksi AI secara real-time</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {predictions.map((p) => {
            const diff = p.aiProb - p.marketProb;
            const signal = diff > 10 ? "positive" : diff < -10 ? "negative" : "neutral";
            return (
              <div key={p.id} className="glass-card p-5 hover:scale-[1.01] transition-transform space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight">{p.event}</h3>
                  <Badge variant={p.status === "selesai" ? "default" : "secondary"} className="shrink-0 text-xs">{p.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">AI</p>
                    <p className="text-xl font-bold text-primary">{p.aiProb}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground">Market</p>
                    <p className="text-xl font-bold">{p.marketProb}%</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{p.confidence}%</span>
                  </div>
                  <Progress value={p.confidence} className="h-2" />
                </div>
                <div className={`text-xs font-medium ${signal === "positive" ? "text-success" : signal === "negative" ? "text-destructive" : "text-warning"}`}>
                  {signal === "positive" ? "🟢 AI lebih optimis" : signal === "negative" ? "🔴 AI lebih pesimis" : "🟡 Selisih kecil"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
