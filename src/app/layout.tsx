import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientAppShell } from "@/components/ClientAppShell";

const arcadeGamer = localFont({
  src: "./fonts/ArcadeGamer-Regular.ttf",
  variable: "--font-arcade",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invictos — Draft a historic XI",
  description:
    "Draft a historic World Cup XI. Simulate a World Cup. See if you can win it undefeated.",
  openGraph: {
    title: "Invictos",
    description: "Can your XI win the World Cup undefeated?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${arcadeGamer.variable} h-full`}>
      <body className={`${arcadeGamer.className} min-h-full font-sans antialiased`}>
        <ClientAppShell>{children}</ClientAppShell>
      </body>
    </html>
  );
}
