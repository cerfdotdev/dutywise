import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { sandboxNotice, siteUrl } from "@/lib/site";
import { SiteShell } from "@/components/SiteShell";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DutyWise — Duties, done right.",
    template: "%s — DutyWise",
  },
  description:
    "AI-native customs brokerage for US importers. A licensed broker signs every filing, at a published $99, $89, or $69 per entry — $0 handling, no minimums. When duty rates fall, we file your refund. CBP pays you.",
  applicationName: "DutyWise",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "DutyWise",
    title: "DutyWise — Duties, done right.",
    description:
      "Flat per-entry pricing, licensed brokers on every filing, and refunds filed free when CBP owes you money.",
    url: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#0E2A47",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="grain">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteShell />
        <SiteNav sandbox={sandboxNotice} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
