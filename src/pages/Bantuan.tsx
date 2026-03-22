import { DashboardLayout } from "@/components/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, MessageCircle, BookOpen, Zap, Search, ExternalLink, Github, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const faqs = [
  {
    cat: "Umum",
    q: "Apa itu ExaBot dan bagaimana cara kerjanya?",
    a: "ExaBot adalah platform AI prediksi yang menggunakan multi-model machine learning untuk menganalisis dan memprediksi hasil dari berbagai event di prediction market seperti Polymarket. Sistem menggabungkan analisis sentimen, data ekonomi, dan pola historis untuk menghasilkan probabilitas yang akurat.",
  },
  {
    cat: "Data",
    q: "Apakah data prediksi diperbarui secara real-time?",
    a: "Ya, data diperbarui secara real-time setiap beberapa menit. Model AI menganalisis data terbaru dari lebih dari 100 sumber berita, media sosial, dan data ekonomi, kemudian memperbarui probabilitas secara kontinu.",
  },
  {
    cat: "Simulasi",
    q: "Bagaimana cara kerja paper trading (simulasi)?",
    a: "Paper trading memungkinkan Anda berlatih prediksi menggunakan saldo virtual Rp 100.000 tanpa risiko keuangan nyata. Setiap prediksi dicatat, dan Anda dapat melihat win rate, profit/loss, serta grafik performa seiring waktu.",
  },
  {
    cat: "AI",
    q: "Apa itu Brier Score dan mengapa penting?",
    a: "Brier Score mengukur akurasi prediksi probabilistik. Skor mendekati 0 menunjukkan prediksi sangat akurat, sementara skor mendekati 1 menunjukkan prediksi buruk. ExaBot menggunakan Brier Score sebagai metrik utama evaluasi model karena lebih fair dibanding akurasi biasa.",
  },
  {
    cat: "Model",
    q: "Bisakah saya menggunakan model AI kustom saya sendiri?",
    a: "Saat ini ExaBot menggunakan 5 model bawaan (Ensemble, BERT, XGBoost, LSTM, GPT). Fitur upload dan integrasi model kustom sedang dalam pengembangan dan akan tersedia di versi 3.0.",
  },
  {
    cat: "API",
    q: "Bagaimana sistem rotasi API key otomatis bekerja?",
    a: "Sistem memantau penggunaan setiap API key secara real-time. Saat mendekati rate limit (85%), sistem akan secara otomatis mengaktifkan key cadangan menggunakan mekanisme blue-green rotation, memastikan tidak ada downtime atau gangguan layanan.",
  },
  {
    cat: "Strategi",
    q: "Apa itu Pembuat Strategi dan bagaimana menggunakannya?",
    a: "Pembuat Strategi adalah fitur visual builder berbasis logika if-this-then-that yang memungkinkan Anda membuat aturan otomatis. Contoh: 'JIKA Confidence AI > 85% DAN Selisih AI-Market > 15%, MAKA Pasang posisi YES'. Strategi dieksekusi secara otomatis oleh sistem.",
  },
  {
    cat: "Keamanan",
    q: "Apakah data saya aman di ExaBot?",
    a: "Ya. Semua data sensitif dienkripsi menggunakan AES-256. API key disimpan terenkripsi dan tidak pernah terekspos ke client. Sistem memiliki audit log lengkap dan proteksi terhadap akses tidak sah.",
  },
];

const resources = [
  { icon: BookOpen, label: "Dokumentasi Lengkap", desc: "Panduan teknis sistem ExaBot", url: "/dokumentasi" },
  { icon: FileText, label: "Panduan Pemula", desc: "Mulai menggunakan ExaBot dari nol", url: "/dokumentasi" },
  { icon: Zap, label: "API Reference", desc: "Dokumentasi REST API ExaBot", url: "#" },
  { icon: Github, label: "GitHub", desc: "Source code (coming soon)", url: "#" },
];

export default function Bantuan() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sent, setSent] = useState(false);

  const categories = ["Semua", ...Array.from(new Set(faqs.map(f => f.cat)))];
  const filtered = faqs.filter(f => {
    const matchCat = activeCategory === "Semua" || f.cat === activeCategory;
    const matchSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bantuan & Dukungan</h1>
          <p className="text-muted-foreground text-sm mt-0.5">FAQ, panduan, dan hubungi tim dukungan kami</p>
        </div>

        {/* Quick Resources */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resources.map((r) => (
            <a
              key={r.label}
              href={r.url}
              className="glass-card p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <r.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">{r.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>

        {/* FAQ */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Pertanyaan Umum (FAQ)</h3>
            <Badge variant="secondary" className="text-[10px] ml-auto">{filtered.length} pertanyaan</Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari pertanyaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 border-border/50"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/40 rounded-xl px-4 bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-left">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      f.cat === "AI" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      f.cat === "API" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-secondary text-muted-foreground border-border"
                    }`}>{f.cat}</span>
                    {f.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada FAQ yang cocok dengan pencarian</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <MessageCircle className="w-4 h-4 text-cyan-500" />
            </div>
            <h3 className="font-semibold">Hubungi Tim Dukungan</h3>
            <Badge className="bg-success/10 text-success border-success/20 border text-[10px] ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block mr-1.5 animate-pulse" />
              Online · Respons &lt; 24 jam
            </Badge>
          </div>
          {sent ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <p className="font-semibold text-success">Pesan Terkirim!</p>
              <p className="text-sm text-muted-foreground mt-1">Tim kami akan merespons dalam 24 jam kerja.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Nama</label>
                  <Input defaultValue="Ahmad Fadhil" className="h-9 bg-secondary/50 border-border/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                  <Input defaultValue="fadhil@exabot.ai" type="email" className="h-9 bg-secondary/50 border-border/50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Subjek</label>
                <Input placeholder="Deskripsikan masalah atau pertanyaan" className="h-9 bg-secondary/50 border-border/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Pesan</label>
                <Textarea placeholder="Detail masalah, langkah yang sudah dicoba, dan informasi lain yang relevan..." className="bg-secondary/50 border-border/50 resize-none" rows={4} />
              </div>
              <Button className="gap-2" onClick={handleSend}>
                <Mail className="w-4 h-4" />
                Kirim Pesan
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
