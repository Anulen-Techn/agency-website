export const GOOGLE_ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || "ca-pub-2488241318986311";

export const ADSENSE_SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT || "",
  middle: process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_SLOT || "",
  bottom: process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_SLOT || "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || "",
} as const;

export const ADSENSE_ENABLED_ROUTES = [
  "/invoice-generator",
  "/quotation-generator",
  "/receipt-generator",
  "/whatsapp-link-generator",
  "/qr-code-generator",
  "/profit-calculator",
  "/image-tools",
  "/image-compressor",
  "/background-remover",
] as const;

export function isAdsenseEnabledRoute(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return ADSENSE_ENABLED_ROUTES.some((route) => route === normalized);
}
