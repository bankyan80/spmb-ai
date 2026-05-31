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
  title: "SPMB SD 2026/2027 - Seleksi Penerimaan Murid Baru",
  description: "Aplikasi SPMB SD untuk membantu orang tua/wali calon siswa jenjang SD dalam proses Seleksi Penerimaan Murid Baru Tahun Ajaran 2026/2027.",
  keywords: ["SPMB", "Pendaftaran Sekolah", "SD", "Seleksi Penerimaan Murid Baru", "2026/2027"],
  authors: [{ name: "SPMB SD 2026/2027" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SPMB SD 2026/2027 - Seleksi Penerimaan Murid Baru",
    description: "Sistem Seleksi Penerimaan Murid Baru SD Tahun Ajaran 2026/2027",
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
