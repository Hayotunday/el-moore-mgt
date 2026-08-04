import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";

const axiforma = localFont({
  src: [
    {
      path: "../public/fonts/Axiforma-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Axiforma-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Axiforma-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Axiforma-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "El-Moore",
  description: "Trusted real estate partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", axiforma.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1" style={{ backgroundColor: "#fcfbf8" }}>
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
