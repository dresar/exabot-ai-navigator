import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, BookOpen } from "lucide-react";

/** Konten bantuan statis (bukan data dashboard). */
export default function Bantuan() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bantuan</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Ringkasan penggunaan ExaBot</p>
        </div>

        <div className="glass-card p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            ExaBot menghubungkan frontend ke backend FastAPI (REST + WebSocket). Autentikasi memakai JWT — login
            untuk mengakses data riil pasar, prediksi, dan analisis.
          </p>
          <p>
            Paper trading dan backtesting mengikuti respons API. Jika tabel kosong, pastikan database, worker ingestion, dan
            pipeline AI sudah dikonfigurasi di server.
          </p>
          <p>
            Untuk integrasi LLM, backend mendukung gateway OpenAI-compatible (mis. variabel <code className="text-xs bg-secondary px-1 rounded">LLM_BASE_URL</code> /{" "}
            <code className="text-xs bg-secondary px-1 rounded">LLM_API_KEY</code>).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/dokumentasi">
              <BookOpen className="w-4 h-4" />
              Dokumentasi teknis
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" type="button" disabled>
            <Mail className="w-4 h-4" />
            Email support (atur di deployment)
          </Button>
        </div>

        <div className="flex items-start gap-3 text-xs text-muted-foreground border border-border/50 rounded-lg p-4">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Lihat juga README di repositori <code>exabot-backend</code> untuk perintah <code>uvicorn</code>, Alembic, dan Celery.
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
