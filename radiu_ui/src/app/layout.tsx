import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "radiuAI - AI Market Intelligence",
  description: "AI-powered market intelligence and analysis platform",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 w-full">
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-4 lg:hidden md:hidden">
                  <div>
                    <SidebarTrigger className="text-white flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl animate-pulse-glow" />
                  </div>
                </div>
                <div className="p-4 md:p-6 lg:p-8">{children}</div>
              </main>
            </SidebarProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
