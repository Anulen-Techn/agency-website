"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GOOGLE_ADSENSE_ID, isAdsenseEnabledRoute } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdProps = {
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  layout?: string;
  layoutKey?: string;
};

export default function AdSenseAd({ slot, format = "auto", responsive = true, className = "", layout, layoutKey }: AdSenseAdProps) {
  const pathname = usePathname();
  const pushed = useRef(false);
  const canRender = Boolean(GOOGLE_ADSENSE_ID && slot && pathname && isAdsenseEnabledRoute(pathname));

  useEffect(() => {
    pushed.current = false;
  }, [pathname, slot, format, layout, layoutKey]);

  useEffect(() => {
    if (!canRender || process.env.NODE_ENV !== "production" || pushed.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // Ad blockers and delayed AdSense loading should never break the page.
    }
  }, [canRender, pathname, slot, format, layout, layoutKey]);

  if (!canRender) return null;

  return (
    <aside className={`ad-container no-print mx-auto w-full max-w-7xl px-6 py-6 md:px-12 lg:px-20 ${className}`} aria-label="Advertisement">
      <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Advertisement</p>
      {process.env.NODE_ENV === "production" ? (
        <ins
          className="adsbygoogle block min-h-[120px] w-full overflow-hidden rounded-[1.25rem]"
          data-ad-client={GOOGLE_ADSENSE_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
          data-ad-layout={layout}
          data-ad-layout-key={layoutKey}
        />
      ) : (
        <div className="flex min-h-[120px] items-center justify-center rounded-[1.25rem] border border-dashed border-black/15 bg-[#f7f7f4] text-sm text-neutral-500 dark:border-white/15 dark:bg-white/10 dark:text-neutral-300">
          AdSense placeholder
        </div>
      )}
    </aside>
  );
}
