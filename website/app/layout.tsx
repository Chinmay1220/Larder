import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Larder — Your kitchen's memory",
  description:
    "Snap your grocery receipt. Larder tracks what you have, shows what's about to expire, and warns you before you overbuy.",
  openGraph: {
    title: "Larder — Your kitchen's memory",
    description:
      "Snap your grocery receipt. Larder tracks what you have, shows what's about to expire, and warns you before you overbuy.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable} antialiased`}>
      <body className="min-h-full bg-(--color-surface) text-(--color-text-primary)">
        {children}
      </body>
    </html>
  );
}
