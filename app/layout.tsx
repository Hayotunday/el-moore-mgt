import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

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
  icons: {
    icon: "../public/assets/el-moore.png",
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
      className={cn("h-full", "antialiased", axiforma.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="" style={{ backgroundColor: "#fcfbf8" }}>
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
