import type { ManifestTheme } from "@/lib/owuan/types";

function camelToCssVar(key: string): string {
  return (
    "--" +
    key
      .replace(/([A-Z])/g, "-$1")
      .replace(/([0-9]+)/g, "-$1")
      .replace(/^-/, "")
      .replace(/-+/g, "-")
      .toLowerCase()
  );
}

interface ManifestThemeShape {
  colors?: Record<string, string>;
  darkColors?: Record<string, string>;
  fontFamilies?: { heading?: string; sans?: string; mono?: string };
  borderRadius?: string;
  darkModeSupport?: boolean;
}

const GENERIC_FONTS = new Set(["sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "cursive", "fantasy", "inherit", "initial"]);

// Manifest fontFamilies'ten ilk aile adlarını ayıklar (ör. "Inter, sans-serif" → "Inter").
function firstFamily(value?: string): string | null {
  if (!value) return null;
  const name = value.split(",")[0].trim().replace(/['"]/g, "");
  if (!name || GENERIC_FONTS.has(name.toLowerCase())) return null;
  return name;
}

// Manifest fontlarını yüklemek için Google Fonts css2 URL'i üretir (yüklü olmayan fontlar render olsun).
export function googleFontsUrl(theme: ManifestThemeShape | null | undefined): string | null {
  const ff = theme?.fontFamilies;
  if (!ff) return null;
  const names = Array.from(new Set([firstFamily(ff.heading), firstFamily(ff.sans), firstFamily(ff.mono)].filter((n): n is string => !!n)));
  if (names.length === 0) return null;
  const families = names.map((n) => `family=${n.replace(/ /g, "+")}:wght@400;500;600;700`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// R2 manifest'in flat (camelCase) tema şekli için CSS değişkenleri üretir.
export function generateThemeCssFromManifest(theme: ManifestThemeShape | null | undefined): string {
  const colors = theme?.colors;
  if (!colors) return "";
  const lines: string[] = [":root {"];
  for (const [k, v] of Object.entries(colors)) lines.push(`  ${camelToCssVar(k)}: ${v};`);
  if (theme?.borderRadius) lines.push(`  --radius: ${theme.borderRadius};`);
  if (theme?.fontFamilies?.heading) {
    // Başlıklar `font-serif` kullanıyor → --font-serif'e de uygula
    lines.push(`  --font-heading: ${theme.fontFamilies.heading};`);
    lines.push(`  --font-serif: ${theme.fontFamilies.heading};`);
  }
  if (theme?.fontFamilies?.sans) lines.push(`  --font-sans: ${theme.fontFamilies.sans};`);
  if (theme?.fontFamilies?.mono) lines.push(`  --font-mono: ${theme.fontFamilies.mono};`);
  lines.push("}");
  if (theme?.darkModeSupport && theme.darkColors) {
    lines.push(".dark {");
    for (const [k, v] of Object.entries(theme.darkColors)) lines.push(`  ${camelToCssVar(k)}: ${v};`);
    lines.push("}");
  }
  return lines.join("\n");
}

const COLOR_VAR_MAP: Record<string, string> = {
  primary: "--primary",
  secondary: "--secondary",
  accent: "--accent",
  background: "--background",
  foreground: "--foreground",
  muted: "--muted",
  border: "--border",
  input: "--input",
  ring: "--ring",
  card: "--card",
  destructive: "--destructive",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
};

function deriveForegroundVars(
  colors: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (colors.primary)
    vars["--primary-foreground"] = contrastColor(colors.primary);
  if (colors.secondary)
    vars["--secondary-foreground"] = contrastColor(colors.secondary);
  if (colors.accent)
    vars["--accent-foreground"] = contrastColor(colors.accent);
  if (colors.foreground) vars["--card-foreground"] = colors.foreground;
  if (colors.foreground) vars["--popover-foreground"] = colors.foreground;
  if (colors.card) vars["--popover"] = colors.card;
  if (colors.destructive)
    vars["--destructive-foreground"] = "oklch(0.995 0 0)";

  if (colors.background) {
    vars["--sidebar"] = colors.background;
    vars["--sidebar-primary"] = colors.primary || "";
    vars["--sidebar-primary-foreground"] =
      colors.primary ? contrastColor(colors.primary) : "";
    vars["--sidebar-accent"] = colors.muted || "";
    vars["--sidebar-border"] = colors.border || "";
    vars["--sidebar-ring"] = colors.ring || "";
  }
  if (colors.foreground) {
    vars["--sidebar-foreground"] = colors.foreground;
    vars["--sidebar-accent-foreground"] = colors.foreground;
  }

  return vars;
}

function contrastColor(oklch: string): string {
  const match = oklch.match(/oklch\(\s*([\d.]+)\s/);
  if (match) {
    const l = parseFloat(match[1]);
    return l > 0.55 ? "oklch(0.15 0.01 30)" : "oklch(0.985 0 0)";
  }
  return "oklch(0.985 0 0)";
}

export function generateThemeCSS(theme: ManifestTheme | null): string {
  if (!theme?.colors?.light) return "";

  const lines: string[] = [];

  const lightColors = { ...theme.colors.light, ...deriveForegroundVars(theme.colors.light) };

  lines.push(":root {");
  for (const [key, varName] of Object.entries(COLOR_VAR_MAP)) {
    if (lightColors[key]) {
      lines.push(`  ${varName}: ${lightColors[key]};`);
    }
  }
  for (const [varName, value] of Object.entries(lightColors)) {
    if (varName.startsWith("--")) {
      lines.push(`  ${varName}: ${value};`);
    }
  }
  if (theme.borderRadius) {
    lines.push(`  --radius: ${theme.borderRadius};`);
  }
  if (theme.fontFamilies?.heading) {
    lines.push(`  --font-heading: ${theme.fontFamilies.heading};`);
  }
  if (theme.fontFamilies?.sans) {
    lines.push(`  --font-sans: ${theme.fontFamilies.sans};`);
  }
  if (theme.fontFamilies?.mono) {
    lines.push(`  --font-mono: ${theme.fontFamilies.mono};`);
  }
  lines.push("}");

  if (theme.darkModeSupport && theme.colors?.dark) {
    const darkColors = { ...theme.colors.dark, ...deriveForegroundVars(theme.colors.dark) };

    lines.push(".dark {");
    for (const [key, varName] of Object.entries(COLOR_VAR_MAP)) {
      if (darkColors[key]) {
        lines.push(`  ${varName}: ${darkColors[key]};`);
      }
    }
    for (const [varName, value] of Object.entries(darkColors)) {
      if (varName.startsWith("--")) {
        lines.push(`  ${varName}: ${value};`);
      }
    }
    lines.push("}");
  }

  return lines.join("\n");
}
