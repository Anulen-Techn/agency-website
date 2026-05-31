import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anulen — Websites, Automation & Digital Systems",
  description:
    "Anulen builds modern websites, automation systems, and scalable digital products for growing businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
