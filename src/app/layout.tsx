import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/data/site";
import "./globals.css";

const heading = Archivo({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
