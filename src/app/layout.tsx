import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/providers";

const inter = Inter({
  variable: "--font-main",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokéclicker - Idle Pokémon Clicker",
  description:
    "Catch, collect, and level up Pokémon with idle clicker mechanics. Engage in strategic gameplay with incremental progression.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
