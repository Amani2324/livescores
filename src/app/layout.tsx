import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Providers } from "@/components/providers/Providers";
import { ApiSportsWidgetConfig } from "@/components/widgets/ApiSportsWidgetConfig";
import { getApiSportsWidgetPublicKeyOptional, getPublicSiteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: {
    default: "LiveScores Hub — football livescores & previews",
    template: "%s | LiveScores Hub",
  },
  description:
    "Live football scores, fixtures, standings, odds, and data-driven previews powered by Supabase and API-FOOTBALL.",
  applicationName: "LiveScores Hub",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LiveScores Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveScores Hub",
    description: "Live football scores and AI-style previews.",
  },
};

const widgetKey = getApiSportsWidgetPublicKeyOptional();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased">
        {widgetKey ? (
          <Script
            id="api-sports-widgets"
            src="https://widgets.api-sports.io/3.1.0/widgets.js"
            type="module"
            strategy="beforeInteractive"
          />
        ) : null}
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </Providers>
        {widgetKey ? <ApiSportsWidgetConfig apiKey={widgetKey} /> : null}
      </body>
    </html>
  );
}
