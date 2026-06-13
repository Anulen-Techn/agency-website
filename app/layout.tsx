import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
