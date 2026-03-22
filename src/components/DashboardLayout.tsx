import { type ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}
