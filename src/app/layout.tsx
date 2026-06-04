import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ClientAppShell } from "@/components/ClientAppShell";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invictos — Draft a historic XI",
  description:
    "Draft a historic World Cup XI. Simulate a World Cup. See if you can win it invicto.",
  openGraph: {
    title: "Invictos",
    description: "Can your XI win the World Cup invicto?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <ClientAppShell>{children}</ClientAppShell>
      </body>
    </html>
  );
}
