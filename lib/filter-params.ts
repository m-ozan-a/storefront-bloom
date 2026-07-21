// URL filtre paramı yardımcıları — hem server (search page) hem client
// (use-filter-params hook'u) tarafından kullanılır, "use client" OLMAMALI.

export const PAGE_SIZE = 12;

// opt paramı "Ad:Değer" çiftlerinin virgüllü listesidir: opt=Renk:Siyah,Beden:M
export function parseOptionParam(raw: string | null | undefined): Record<string, string[]> {
  const options: Record<string, string[]> = {};
  for (const pair of raw?.split(",") ?? []) {
    const i = pair.indexOf(":");
    if (i <= 0) continue;
    const name = pair.slice(0, i);
    const value = pair.slice(i + 1);
    if (!value) continue;
    (options[name] ??= []).push(value);
  }
  return options;
}

export function serializeOptionParam(options: Record<string, string[]>): string {
  return Object.entries(options)
    .flatMap(([name, vals]) => vals.map((v) => `${name}:${v}`))
    .join(",");
}
