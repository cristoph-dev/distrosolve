"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/barberia" || pathname.startsWith("/barberia/")) {
    return children;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-y-auto bg-[linear-gradient(180deg,#000_0%,#09090b_120px,rgba(9,9,11,0.5)_280px)]">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
