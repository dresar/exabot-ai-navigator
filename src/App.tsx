import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import PrediksiLangsung from "./pages/PrediksiLangsung";
import DataPasar from "./pages/DataPasar";
import AnalisisAI from "./pages/AnalisisAI";
import Simulasi from "./pages/Simulasi";
import BacktestingLab from "./pages/BacktestingLab";
import PelatihanAI from "./pages/PelatihanAI";
import ModelAI from "./pages/ModelAI";
import ManajemenAPIKey from "./pages/ManajemenAPIKey";
import PembuatStrategi from "./pages/PembuatStrategi";
import ManajemenRisiko from "./pages/ManajemenRisiko";
import LogAktivitas from "./pages/LogAktivitas";
import Notifikasi from "./pages/Notifikasi";
import Pengaturan from "./pages/Pengaturan";
import Dokumentasi from "./pages/Dokumentasi";
import Bantuan from "./pages/Bantuan";
import StatusSistem from "./pages/StatusSistem";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/prediksi" element={<PrediksiLangsung />} />
              <Route path="/data-pasar" element={<DataPasar />} />
              <Route path="/analisis" element={<AnalisisAI />} />
              <Route path="/simulasi" element={<Simulasi />} />
              <Route path="/backtesting" element={<BacktestingLab />} />
              <Route path="/pelatihan" element={<PelatihanAI />} />
              <Route path="/model-ai" element={<ModelAI />} />
              <Route path="/api-key" element={<ManajemenAPIKey />} />
              <Route path="/strategi" element={<PembuatStrategi />} />
              <Route path="/risiko" element={<ManajemenRisiko />} />
              <Route path="/log" element={<LogAktivitas />} />
              <Route path="/notifikasi" element={<Notifikasi />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="/dokumentasi" element={<Dokumentasi />} />
              <Route path="/bantuan" element={<Bantuan />} />
              <Route path="/status" element={<StatusSistem />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
