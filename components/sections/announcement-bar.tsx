"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export interface AnnouncementBarData {
  text: string;
  linkUrl?: string;
  linkLabel?: string;
}

const STORAGE_KEY = "announcement-dismissed";

export function AnnouncementBar({ data }: { data: AnnouncementBarData }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== data.text);
  }, [data.text]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, data.text);
    setVisible(false);
  };

  if (!visible || !data.text) return null;

  return (
    <div className="relative z-50 w-full bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-center gap-3 px-10 py-2">
        <p className="text-center text-xs font-medium tracking-wide sm:text-sm">
          {data.text}
          {data.linkUrl ? (
            <Link
              href={data.linkUrl}
              className="ml-2 inline-block underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {data.linkLabel ?? "Detay"}
            </Link>
          ) : null}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Duyuruyu kapat"
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:bg-primary-foreground/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
