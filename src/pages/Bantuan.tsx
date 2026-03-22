import { DashboardLayout } from "@/components/DashboardLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

const faqs = [
  { q: "Apa itu ExaBot?", a: "ExaBot adalah platform AI prediksi yang menggunakan multi-model machine learning untuk menganalisis dan memprediksi hasil dari berbagai event di prediction market." },
  { q: "Apakah data prediksi real-time?", a: "Ya, data diperbarui secara real-time. Model AI menganalisis data terbaru dari berbagai sumber dan memperbarui probabilitas secara kontinu." },
  { q: "Bagaimana cara kerja paper trading?", a: "Paper trading memungkinkan Anda berlatih prediksi menggunakan saldo virtual. Anda bisa memahami cara kerja sistem tanpa risiko keuangan." },
  { q: "Apa itu Brier Score?", a: "Brier Score mengukur akurasi prediksi probabilistik. Skor mendekati 0 menunjukkan prediksi yang sangat akurat, sementara skor mendekati 1 menunjukkan prediksi yang buruk." },
  { q: "Bisakah saya menggunakan model AI saya sendiri?", a: "Saat ini ExaBot menggunakan model bawaan. Fitur upload model kustom sedang dalam pengembangan dan akan tersedia di versi mendatang." },
  { q: "Bagaimana sistem rotasi API key bekerja?", a: "Sistem memantau penggunaan setiap API key. Saat mendekati rate limit, key secara otomatis dirotasi ke key cadangan untuk menjaga ketersediaan layanan." },
];

export default function Bantuan() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Bantuan</h1>
          <p className="text-muted-foreground text-sm mt-1">FAQ dan dukungan teknis</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Pertanyaan Umum (FAQ)</h3>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/30 rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Hubungi Dukungan</h3>
          </div>
          <div className="space-y-3">
            <div><label className="text-sm text-muted-foreground">Subjek</label><Input placeholder="Deskripsikan masalah Anda" className="mt-1" /></div>
            <div><label className="text-sm text-muted-foreground">Pesan</label><Textarea placeholder="Detail masalah atau pertanyaan..." className="mt-1" rows={4} /></div>
            <Button className="gap-2"><Mail className="w-4 h-4" /> Kirim Pesan</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
