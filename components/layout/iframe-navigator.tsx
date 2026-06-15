"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function IframeNavigator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.parent === window) return;
    const qs = searchParams.toString();
    const url = qs ? `${window.location.origin}${pathname}?${qs}` : `${window.location.origin}${pathname}`;
    window.parent.postMessage({ type: "url-change", url }, "*");
  }, [pathname, searchParams]);

  return null;
}
