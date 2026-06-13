import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import SmoothScroll from "@/components/SmoothScroll";

const SITE_URL = "https://factmatch.vercel.app";
const SITE_NAME = "FactMatch";
const SITE_DESC = "A beautiful, privacy-first fact discovery app. Learn something new every scroll. Powered by Wikipedia and free knowledge APIs.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FactMatch — Swipe right on knowledge",
    template: "%s | FactMatch",
  },
  description: SITE_DESC,
  keywords: [
    "facts", "learning", "education", "trivia", "wikipedia", "knowledge",
    "swipe", "feed", "masonry", "science", "history", "technology",
    "fact discovery", "daily learning", "fact app", "swipe to learn",
  ],
  authors: [{ name: "FactMatch" }],
  creator: "FactMatch",
  publisher: "FactMatch",
  category: "education",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
    startupImage: "/factmatch.png",
  },
  icons: {
    icon: [
      { url: "/factmatch.png", type: "image/png" },
    ],
    apple: [
      { url: "/factmatch.png", type: "image/png" },
    ],
    shortcut: "/factmatch.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "FactMatch — Swipe right on knowledge",
    description: SITE_DESC,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FactMatch — Swipe right on knowledge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FactMatch — Swipe right on knowledge",
    description: SITE_DESC,
    images: ["/opengraph-image"],
    creator: "@factflow",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
        ? { "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
        ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION
        ? { "p:domain_verify": process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION }
        : {}),
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0efed" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESC,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      inLanguage: "en",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "63 knowledge categories",
        "Live facts from Wikipedia",
        "Swipe-based learning",
        "Personalized feed",
        "Privacy-first — all data stored locally",
        "Progressive Web App — installable",
        "Daily streak tracking",
        "No account required",
      ],
      screenshot: `${SITE_URL}/opengraph-image`,
      image: `${SITE_URL}/factmatch.png`,
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/factmatch.png`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESC,
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "1",
        bestRating: "5",
        worstRating: "1",
      },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="application/rss+xml" title="FactMatch RSS" href={`${SITE_URL}/rss.xml`} />
        <link rel="alternate" type="application/atom+xml" title="FactMatch Atom" href={`${SITE_URL}/atom.xml`} />
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="preconnect" href="https://en.wikipedia.org" />
        <link rel="dns-prefetch" href="https://opentdb.com" />
        <link rel="dns-prefetch" href="https://catfact.ninja" />
      </head>
      <body className="antialiased">
        <RegisterSW />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
