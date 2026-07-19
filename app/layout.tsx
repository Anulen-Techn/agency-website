import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/theme/ThemeScript";
import { GOOGLE_ADSENSE_ID } from "@/lib/adsense";
// import { Inter } from "next/font/google";

// const inter = Inter({
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  metadataBase: new URL("https://anulen.com"),

  title: {
    default: "Anulen | Websites, Automation & Business Systems",
    template: "%s | Anulen",
  },

  description: "Anulen helps businesses grow through modern websites, WhatsApp automation, CRM systems, business software, and digital solutions.",

  keywords: [
    "Anulen",
    "Website Development",
    "Web Design",
    "Business Automation",
    "WhatsApp Automation",
    "CRM Development",
    "Software Development",
    "Digital Agency",
    "Next.js Development",
    "Nigeria Web Developer",
  ],

  authors: [
    {
      name: "Anulen",
      url: "https://anulen.com",
    },
  ],

  creator: "Anulen",
  publisher: "Anulen",

  other: {
    "google-adsense-account": GOOGLE_ADSENSE_ID,
  },

  openGraph: {
    title: "Anulen | Websites, Automation & Business Systems",

    description: "Helping businesses grow with websites, automation systems, CRM solutions, and modern software development.",

    url: "https://anulen.com",

    siteName: "Anulen",

    locale: "en_US",

    type: "website",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anulen",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Anulen | Websites, Automation & Business Systems",

    description: "Helping businesses grow with websites, automation systems, CRM solutions, and modern software development.",

    images: ["/og-image.jpg"],
  },
};

const googleAnalyticsId = "G-H6T5BQZQ2L";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="google-adsense"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
        <ThemeScript />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
