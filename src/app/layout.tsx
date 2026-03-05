import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Enterprise JSON-to-TS Engine",
  description: "High-performance TypeScript type generator with deterministic validation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.variable} font-sans selection:bg-indigo-100 selection:text-indigo-900`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
