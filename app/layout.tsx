import Providers from "./providers";
import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Schibsted_Grotesk, Geist } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Settings } from "@/components/settings";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const analyticsDomain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
const analyticsScriptUrl = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;

const siteUrl = "https://iamamitkumar.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amit Kumar | Agentic Architect & Full-Stack Engineer",
    template: "%s | Amit Kumar",
  },
  description:
    "Mission Control for AI Agents. Engineering production-grade agentic architectures, trading platforms, and enterprise SaaS.",
  keywords: [
    "Amit Kumar",
    "iamamitkumar",
    "growthperclick",
    "AI Agent Builder",
    "AI Automation",
    "Agentic Architect",
    "Full-Stack Engineer",
    "MVP Builder",
  ],
  authors: [{ name: "Amit Kumar", url: siteUrl }],
  creator: "Amit Kumar",
  openGraph: {
    title: "Amit Kumar | Agentic Architect & Full-Stack Engineer",
    description:
      "Mission Control for AI Agents. Engineering production-grade agentic architectures, trading platforms, and enterprise SaaS.",
    url: siteUrl,
    siteName: "Amit Kumar",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amit Kumar - Agentic Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amit Kumar | Agentic Architect & Full-Stack Engineer",
    description:
      "Mission Control for AI Agents. Engineering production-grade agentic architectures.",
    creator: "@growthperclick",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/profile.jpg",
    shortcut: "/profile.jpg",
    apple: "/profile.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-schibsted-grotesk",
});

export default function RootLayout({ children }) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Amit Kumar",
    alternateName: ["growthperclick", "iamamitkumar"],
    url: siteUrl,
    description:
      "Developer, writer, and content creator building production-grade agentic architectures, multi-agent orchestration, and enterprise SaaS.",
    image: `${siteUrl}/images/og-image.png`,
    email: "hi@iamamitkumar.dev",
    jobTitle: "Developer, Writer, Content Creator",
    sameAs: [
      "https://x.com/growthperclick",
      "https://github.com/ravenrepo",
      "https://www.linkedin.com/in/growthperclick/",
      "https://peerlist.io/growthperclick",
      "https://substack.com/@growthperclick",
    ],
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        inter.variable,
        schibstedGrotesk.variable,
        GeistSans.variable,
        "font-sans antialiased",
      )}
      suppressHydrationWarning
    >
      <body className={cn("font-display bg-theme-bg")}>
        <Script
          id="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
          strategy="afterInteractive"
        />
        <Settings />
        <Navbar />
        <main className="flex min-h-screen flex-col">
          <Providers>{children}</Providers>
        </main>
        <Footer />
        {analyticsDomain && analyticsScriptUrl ? (
          <Script
            src={analyticsScriptUrl}
            data-domain={analyticsDomain}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
