import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientAppShell } from "@/components/ClientAppShell";

const superDario = localFont({
  src: "./fonts/SuperDario-Regular.otf",
  variable: "--font-super-dario",
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
    <html lang="es" className={`${superDario.variable} h-full`}>
      <body className={`${superDario.className} min-h-full font-sans antialiased`}>
        <ClientAppShell>{children}</ClientAppShell>
      </body>
    </html>
  );
}
