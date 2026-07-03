import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "SEOForge — Autonomous SEO, Human Control", template: "%s · SEOForge" },
  description: "A multi-agent SEO and GEO team that audits, researches, proposes, validates, and ships through protected pull requests.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
