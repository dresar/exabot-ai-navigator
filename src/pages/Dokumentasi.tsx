import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Brain, Database, Server, Cpu, ArrowRight, Zap, BarChart3, Shield, RefreshCw,
  BookOpen, Layers, GitBranch, Activity, Globe, Code2, FlaskConical, Target,
  Lock, TrendingUp, ChevronRight, Info, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const sections = [
  { id: "tentang", label: "Tentang ExaBot", icon: BookOpen },
  { id: "alur", label: "Alur Data", icon: GitBranch },
  { id: "ai", label: "Sistem AI", icon: Brain },
  { id: "simulasi", label: "Simulasi & Backtest", icon: FlaskConical },
  { id: "training", label: "Training AI", icon: Cpu },
  { id: "api", label: "Rotasi API Key", icon: RefreshCw },
  { id: "arsitektur", label: "Arsitektur", icon: Layers },
  { id: "evolusi", label: "Evolusi Sistem", icon: TrendingUp },
];

const flowSteps = [
  { label: "Data Mentah", desc: "Berita, sosmed, ekonomi", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "AI Processing", desc: "Multi-model inference", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Analisis", desc: "Sentimen & faktor", icon: BarChart3, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { label: "Prediksi", desc: "Probabilitas & confidence", icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { label: "Evaluasi", desc: "Brier score & akurasi", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
];

const aiModels = [
  { name: "Ensemble v3.2", role: "Model Utama", desc: "Menggabungkan output semua model dengan voting berbobot adaptif. Menghasilkan prediksi akhir yang paling akurat.", akurasi: "87.3%" },
  { name: "Sentimen BERT", role: "NLP Model", desc: "Menganalisis sentimen teks dari ribuan sumber berita dan media sosial. Mendukung multi-bahasa.", akurasi: "81.5%" },
  { name: "XGBoost", role: "Statistik Model", desc: "Model machine learning klasik untuk pola numerik, korelasi variabel ekonomi, dan data historis.", akurasi: "79.2%" },
  { name: "LSTM", role: "Temporal Model", desc: "Deep learning untuk menganalisis pola waktu (time-series). Efektif untuk tren jangka panjang.", akurasi: "76.8%" },
  { name: "GPT Reasoning", role: "LLM Model", desc: "Reasoning kompleks berbasis large language model untuk analisis konteks mendalam.", akurasi: "84.1%" },
];

const archComponents = [
  { icon: Code2, label: "Frontend", desc: "React + TypeScript + Tailwind CSS", sub: "Responsive, dark mode, mobile-first UI", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Server, label: "Backend API", desc: "Node.js + Express / FastAPI", sub: "REST API dengan autentikasi JWT", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Database, label: "Database", desc: "PostgreSQL + Redis Cache", sub: "ACID-compliant dengan replikasi", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { icon: Zap, label: "Message Queue", desc: "Redis Queue + Workers", sub: "Job async untuk training & scraping", color: "text-orange-500", bg: "bg-orange-500/10" },
  { icon: Brain, label: "AI Engine", desc: "Python + PyTorch + scikit-learn", sub: "Multi-model inference server", color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Shield, label: "Security Layer", desc: "API Gateway + Rate Limiting", sub: "Enkripsi end-to-end & audit log", color: "text-success", bg: "bg-success/10" },
];

export default function Dokumentasi() {
  const [activeSection, setActiveSection] = useState("tentang");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs">v2.4.1</Badge>
              <Badge className="bg-success/10 text-success border-success/20 border text-xs">Terbaru</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Dokumentasi Sistem ExaBot</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-2xl leading-relaxed">
              Panduan lengkap cara kerja, arsitektur, dan alur data platform prediksi AI ExaBot.
              Dirancang untuk membantu developer dan pengguna memahami sistem secara mendalam.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar nav */}
          <div className="lg:w-56 shrink-0">
            <div className="glass-card p-2 lg:sticky lg:top-20">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">Daftar Isi</p>
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all w-full text-left ${
                    activeSection === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5 shrink-0" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6 min-w-0">

            {/* Tentang */}
            <div id="tentang" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Tentang ExaBot</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">ExaBot</span> adalah platform AI prediksi berbasis prediction market yang menggabungkan
                  analisis sentimen, machine learning, dan data pasar real-time untuk menghasilkan prediksi probabilistik berkualitas tinggi.
                </p>
                <p>
                  Sistem ini dirancang untuk memberikan <span className="text-primary font-medium">edge kompetitif</span> dalam prediction market
                  seperti Polymarket, dengan mengintegrasikan lebih dari 5 model AI yang bekerja secara sinergis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Model AI", value: "5+ Model", color: "text-purple-500" },
                    { label: "Akurasi Rata-rata", value: "87.3%", color: "text-success" },
                    { label: "Prediksi Diproses", value: "1.247+", color: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-secondary/50 border border-border/40 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alur Data */}
            <div id="alur" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <GitBranch className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-bold">Alur Data</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-center py-4">
                {flowSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl ${step.bg} border border-border/30 min-w-24 text-center`}>
                      <div className={`p-2 rounded-lg bg-background/50`}>
                        <step.icon className={`w-4 h-4 ${step.color}`} />
                      </div>
                      <p className={`text-xs font-bold ${step.color}`}>{step.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{step.desc}</p>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Data dikumpulkan dari lebih dari 100 sumber (berita internasional, Twitter/X, Reddit, data ekonomi Federal Reserve, dll),
                kemudian diproses secara paralel oleh multi-model AI, dianalisis untuk menghasilkan prediksi probabilistik,
                dan dievaluasi terus-menerus untuk peningkatan akurasi berkelanjutan.
              </p>
            </div>

            {/* AI System */}
            <div id="ai" className="glass-card p-6 space-y-5 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold">Sistem AI Multi-Model</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                ExaBot menggunakan arsitektur ensemble yang menggabungkan 5 model AI berbeda. Setiap model memiliki keunggulan spesifik,
                dan hasilnya digabungkan menggunakan weighted voting adaptif.
              </p>
              <div className="space-y-3">
                {aiModels.map((model, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{model.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{model.role}</Badge>
                        <span className="text-xs font-bold text-success ml-auto">{model.akurasi}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{model.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulasi & Backtesting */}
            <div id="simulasi" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <FlaskConical className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold">Simulasi & Backtesting</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-sm">Paper Trading</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Simulasi prediksi dengan saldo virtual tanpa risiko uang nyata. Sistem memungkinkan pengguna menguji strategi prediksi
                    secara realistis menggunakan kondisi pasar aktual.
                  </p>
                  <div className="space-y-1 mt-2">
                    {["Saldo virtual Rp 100.000 awal", "Win/loss tracking otomatis", "Grafik performa real-time", "Histori lengkap semua posisi"].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-sm">Backtesting</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Menguji model AI pada data historis untuk memvalidasi performa sebelum deployment ke produksi.
                    Menghasilkan metrik evaluasi komprehensif.
                  </p>
                  <div className="space-y-1 mt-2">
                    {["Brier Score sebagai metrik utama", "Akurasi per kategori event", "Perbandingan dengan baseline", "Export hasil ke CSV"].map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Training */}
            <div id="training" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <Cpu className="w-5 h-5 text-success" />
                </div>
                <h2 className="text-xl font-bold">Proses Training AI</h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  Model AI ExaBot dilatih secara berkala dengan dataset baru untuk menjaga relevansi dan akurasi. Proses training
                  menggunakan pipeline terdistribusi yang dapat memproses ratusan ribu record secara efisien.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Upload dataset CSV/JSON", "Validasi otomatis data", "Distributed training", "Evaluasi performa", "Auto-deploy jika akurasi naik"].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 text-xs">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-info/5 border border-primary/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Model baru hanya di-deploy ke produksi jika akurasi pada validation set meningkat minimal 0.5% dibanding versi sebelumnya.
                </p>
              </div>
            </div>

            {/* API Rotation */}
            <div id="api" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <RefreshCw className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-xl font-bold">Sistem Rotasi API Key</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ExaBot menggunakan sistem rotasi API key otomatis untuk menjaga keamanan, menghindari rate limiting,
                dan memastikan ketersediaan layanan 24/7 tanpa downtime.
              </p>
              <div className="flex flex-wrap items-center gap-2 justify-start py-2">
                {["Key Aktif (Primary)", "Monitor Penggunaan", "Alert 85%", "Aktivasi Backup Key", "Deaktivasi Key Lama", "Reset Counter"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border/50 text-xs font-medium">{step}</div>
                    {i < 5 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { icon: Lock, label: "Keamanan", desc: "Key dienkripsi di server, tidak pernah terekspos ke client" },
                  { icon: Zap, label: "Zero Downtime", desc: "Blue-green rotation tanpa gangguan layanan" },
                  { icon: Activity, label: "Monitoring", desc: "Alert realtime saat penggunaan > 85%" },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-xl bg-secondary/40 border border-border/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold">{f.label}</span>
                    </div>
                    <p className="text-muted-foreground leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture */}
            <div id="arsitektur" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Layers className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-bold">Arsitektur Sistem</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                ExaBot dibangun dengan arsitektur modular dan scalable, memungkinkan setiap komponen dikembangkan dan di-deploy secara independen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {archComponents.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${c.bg}`}>
                        <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                      </div>
                      <span className="font-semibold text-sm">{c.label}</span>
                    </div>
                    <p className={`text-xs font-medium ${c.color}`}>{c.desc}</p>
                    <p className="text-[11px] text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolusi */}
            <div id="evolusi" className="glass-card p-6 space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <h2 className="text-xl font-bold">Evolusi & Pengembangan Sistem</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ExaBot dirancang untuk terus berkembang dan meningkatkan akurasi seiring waktu. Dengan arsitektur modular,
                setiap komponen dapat diperbarui secara independen tanpa mengganggu sistem lain.
              </p>
              <div className="space-y-3">
                {[
                  { phase: "Fase 1 (Selesai)", desc: "Frontend mockup, design system, routing semua halaman", done: true },
                  { phase: "Fase 2 (Berikutnya)", desc: "Integrasi backend REST API, autentikasi, database PostgreSQL", done: false },
                  { phase: "Fase 3 (Mendatang)", desc: "Koneksi Polymarket API, live predictions, paper trading nyata", done: false },
                  { phase: "Fase 4 (Visi)", desc: "Auto-trading, model self-improvement, marketplace strategi", done: false },
                ].map((p, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${p.done ? "bg-success/5 border border-success/20" : "bg-secondary/30 border border-border/40"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${p.done ? "bg-success/20" : "bg-secondary border border-border"}`}>
                      {p.done ? <CheckCircle2 className="w-3 h-3 text-success" /> : <span className="text-[9px] text-muted-foreground font-bold">{i + 1}</span>}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${p.done ? "text-success" : "text-muted-foreground"}`}>{p.phase}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
