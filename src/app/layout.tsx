import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SPMB AI - Asisten Pendaftaran Sekolah",
  description: "Aplikasi Chat SPMB AI berbasis Android untuk membantu orang tua/wali calon siswa jenjang SD dalam proses Seleksi Penerimaan Murid Baru.",
  keywords: ["SPMB", "Pendaftaran Sekolah", "SD", "AI", "Seleksi Penerimaan Murid Baru"],
  authors: [{ name: "SPMB AI Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SPMB AI - Asisten Pendaftaran Sekolah",
    description: "Chat AI untuk membantu proses pendaftaran sekolah dasar",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1565C0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-[#F3F8FF] text-[#1F2937]`}
        style={{ fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
