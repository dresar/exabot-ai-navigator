import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, Server, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const endpoints = [
  { group: "Auth", paths: ["POST /api/v1/auth/register", "POST /api/v1/auth/login", "POST /api/v1/auth/dev-login", "POST /api/v1/auth/refresh", "POST /api/v1/auth/logout"] },
  { group: "User", paths: ["GET /api/v1/users/me", "PUT /api/v1/users/me", "PUT /api/v1/users/me/password", "GET /api/v1/users/me/settings", "PUT /api/v1/users/me/settings"] },
  { group: "Stats & pasar", paths: ["GET /api/v1/stats/summary", "GET /api/v1/markets", "GET /api/v1/markets/categories", "POST /api/v1/markets/{id}/watch"] },
  { group: "Prediksi & analisis", paths: ["GET /api/v1/predictions", "GET /api/v1/predictions/live", "POST /api/v1/predictions/analyze", "GET /api/v1/analysis/{event_id}"] },
  { group: "Lainnya", paths: ["GET /api/v1/models", "GET /api/v1/keys", "GET /api/v1/simulation/account", "GET /api/v1/backtest/history", "GET /api/v1/status/services"] },
];

export default function Dokumentasi() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dokumentasi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Referensi cepat — detail lengkap di OpenAPI backend</p>
          <Badge variant="secondary" className="mt-2 text-[10px]">
            Dev: http://localhost:3003/docs
          </Badge>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Server className="w-4 h-4" />
            Stack
          </div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Backend: FastAPI, SQLAlchemy async, Redis, Celery (lihat folder <code className="text-xs">exabot-backend</code>)</li>
            <li>Frontend: Vite + React, React Query, proxy <code className="text-xs">/api</code> ke port 3003</li>
            <li>WebSocket: <code className="text-xs">/ws/predictions?token=...</code> (bukan di bawah <code className="text-xs">/api/v1</code>)</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Code2 className="w-4 h-4" />
            Contoh endpoint (prefix <code className="text-xs">/api/v1</code>)
          </div>
          {endpoints.map((g) => (
            <div key={g.group} className="glass-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{g.group}</p>
              <ul className="space-y-1 font-mono text-xs text-foreground/90">
                {g.paths.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Dokumentasi ini tidak menampilkan metrik contoh; gunakan respons API nyata dari environment Anda.</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
