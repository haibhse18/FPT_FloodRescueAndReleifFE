import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import AuthInitializer from "@/shared/components/AuthInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FPT Flood Rescue and Relief",
  description: "Flood Rescue and Relief Management System",
  icons: {
    icon: "/images/project-logo.png",
    shortcut: "/images/project-logo.png",
    apple: "/images/project-logo.png",
  },
};

import { Toaster as SonnerToaster } from "@/shared/ui/components/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthInitializer />
          {children}
          <SonnerToaster position="top-right" />
        </ErrorBoundary>
      </body>
    </html>
  );
}
