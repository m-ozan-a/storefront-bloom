"use client";

import { useEffect, useState } from "react";

// Paylaşılan client component — hem json-render registry (components.tsx) hem
// codegen üretilen sayfa (owuan/mastra/tools/codegen-tools.ts) bunu import eder.
// Client interaktifliği gerektiği için Hero/Banner gibi gerçek dosya olarak tutulur;
// codegen inline client kod üretmez.

interface CountdownData {
  targetDate: string;
  title?: string;
  expiredText?: string;
}

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownSection({ data }: { data: CountdownData }) {
  const target = new Date(data.targetDate).getTime();
  const valid = !Number.isNaN(target);
  const [remaining, setRemaining] = useState(() =>
    getRemaining(valid ? target : Date.now())
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!valid) return;
    setMounted(true);
    setRemaining(getRemaining(target));
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target, valid]);

  if (!valid) return null;

  // expired yalnızca mount sonrası — server/client ilk render aynı dalı seçsin (hidrasyon).
  const expired = mounted && remaining.diff <= 0;
  const units = [
    { label: "Gün", value: remaining.days },
    { label: "Saat", value: remaining.hours },
    { label: "Dakika", value: remaining.minutes },
    { label: "Saniye", value: remaining.seconds },
  ];

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      {data.title && <h2 className="mb-8 text-2xl font-bold">{data.title}</h2>}
      {expired ? (
        <p className="text-lg text-muted-foreground">
          {data.expiredText || "Süre doldu"}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex min-w-16 flex-col items-center rounded-lg border border-border px-4 py-3"
            >
              <span className="text-3xl font-bold tabular-nums" suppressHydrationWarning>
                {mounted ? String(u.value).padStart(2, "0") : "--"}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
