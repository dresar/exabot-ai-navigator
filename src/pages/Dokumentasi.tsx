import { DashboardLayout } from "@/components/DashboardLayout";
import { Brain, Database, Server, Cpu, ArrowRight, Zap, BarChart3, Shield, RefreshCw, BookOpen, Layers, GitBranch } from "lucide-react";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="glass-card p-6 space-y-3">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-primary/10"><Icon className="w-5 h-5 text-primary" /></div>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function Dokumentasi() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Dokumentasi Sistem</h1>
          <p className="text-muted-foreground text-sm mt-1">Panduan lengkap cara kerja ExaBot</p>
        </div>

        <Section icon={BookOpen} title="Tentang ExaBot">
          <p>ExaBot adalah platform AI prediksi yang menggabungkan analisis sentimen, machine learning, dan data pasar untuk menghasilkan prediksi probabilistik berkualitas tinggi. Sistem ini dirancang untuk memberikan edge dalam prediction market.</p>
        </Section>

        {/* Data Flow */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10"><GitBranch className="w-5 h-5 text-primary" /></div>
            <h2 className="text-lg font-bold">Alur Data</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-center py-4">
            {["Data Mentah", "AI Processing", "Analisis", "Prediksi", "Evaluasi"].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm border border-primary/20">{step}</div>
                {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Data dikumpulkan dari berbagai sumber (berita, sosial media, data ekonomi), diproses oleh multi-model AI, dianalisis untuk menghasilkan prediksi probabilistik, lalu dievaluasi untuk peningkatan berkelanjutan.</p>
        </div>

        <Section icon={Brain} title="Multi-Model AI">
          <p>ExaBot menggunakan arsitektur multi-model yang terdiri dari:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Ensemble v3.2</strong> — Gabungan semua model untuk prediksi akhir</li>
            <li><strong>Sentimen BERT</strong> — Analisis sentimen dari teks berita dan sosial media</li>
            <li><strong>XGBoost</strong> — Model statistik untuk pola numerik historis</li>
            <li><strong>LSTM</strong> — Analisis pola temporal dan time-series</li>
            <li><strong>GPT Reasoning</strong> — Reasoning kompleks berbasis LLM</li>
          </ul>
        </Section>

        <Section icon={BarChart3} title="Analisis Sentimen">
          <p>Sistem menganalisis sentimen dari ribuan sumber data termasuk berita, tweet, forum diskusi, dan laporan analis. Sentimen dikategorikan menjadi positif, negatif, dan netral dengan skor probabilitas.</p>
        </Section>

        <Section icon={Zap} title="Simulasi & Backtesting">
          <p><strong>Paper Trading</strong> — Simulasi prediksi dengan saldo virtual tanpa risiko uang nyata. Cocok untuk menguji strategi sebelum implementasi.</p>
          <p><strong>Backtesting</strong> — Uji model AI pada data historis untuk mengukur akurasi dan Brier Score. Membantu validasi model sebelum deployment.</p>
        </Section>

        <Section icon={Cpu} title="Training AI">
          <p>Model AI dilatih secara berkala dengan dataset baru untuk meningkatkan akurasi. Proses training mendukung upload dataset custom (CSV/JSON). Peningkatan performa dipantau melalui grafik learning curve.</p>
        </Section>

        <Section icon={RefreshCw} title="Rotasi API Key">
          <p>Sistem mendukung rotasi otomatis API key untuk menjaga keamanan dan menghindari rate limiting. Setiap key dipantau penggunaannya dan akan dirotasi saat mendekati limit.</p>
        </Section>

        {/* Architecture */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10"><Layers className="w-5 h-5 text-primary" /></div>
            <h2 className="text-lg font-bold">Arsitektur Sistem</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Server, label: "Frontend", desc: "React + TypeScript, Responsive UI" },
              { icon: Database, label: "Backend", desc: "API Server, Business Logic" },
              { icon: Database, label: "Database", desc: "PostgreSQL, Redis Cache" },
              { icon: Zap, label: "Queue", desc: "Message Queue, Worker Jobs" },
            ].map((a, i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-center space-y-2">
                <a.icon className="w-6 h-6 text-primary mx-auto" />
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Section icon={Shield} title="Evolusi Sistem">
          <p>ExaBot dirancang untuk berkembang seiring waktu. Dengan arsitektur modular, setiap komponen dapat diperbarui secara independen. Model AI terus dilatih dengan data baru, dan strategi trading dioptimasi berdasarkan hasil evaluasi historis.</p>
        </Section>
      </div>
    </DashboardLayout>
  );
}
