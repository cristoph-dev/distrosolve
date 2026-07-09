import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "../components/SidebarContext";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "distrosolve | Simulador de distribuciones de probabilidad",
  description: "Distrosolve - Solve your distribution challenges",
  icons: {
    icon: "/fino-app-logo-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="h-full flex flex-col bg-black text-white">
        <TooltipProvider delayDuration={200}>
          <SidebarProvider>
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex flex-1 flex-col overflow-y-auto bg-zinc-950/50">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

