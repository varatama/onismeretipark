import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Virtuális Önismereti Park",
  description: "Fedezd fel az önismeret vidámparkját.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Önismereti Park",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          {/* Outer Centering Container */}
          <div className="flex justify-center min-h-screen bg-stone-200">
            {/* Mobile Content Container */}
            <div className="w-full max-w-[440px] bg-stone-50 min-h-screen relative shadow-2xl flex flex-col border-x border-stone-300/50 overflow-x-hidden">

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col w-full">
                {children}
              </main>

              {/* Bottom Navigation */}
              <BottomNav />

            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
