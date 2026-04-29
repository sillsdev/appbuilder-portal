type ThemeColor = string | { light: string; dark: string };

function normalizeRgbHex(themeColor: string | null | undefined) {
  if (!themeColor) return null;

  // Google Play manifests provide RGB hex colors; normalize before converting to CSS HSL (Hue, Saturation, Lightness).
  const clean = themeColor.trim().replace(/^#/, '');
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  // Invalid or missing manifest colors should leave Daisy's default theme untouched.
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  return normalized;
}

function getHslAndLuminance(hex: string) {
  const int = Number.parseInt(hex, 16);
  // Convert 0-255 RGB channels to the 0-1 range used by HSL and luminance formulas.
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  // Gray colors have no hue; keep the defaults and only use their lightness.
  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        hue = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }
    hue /= 6;
  }

  // Relative luminance gives a better text-color choice than checking lightness alone.
  const toLinear = (channel: number) =>
    channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const hsl = `hsl(${(hue * 360).toFixed(1)} ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}%)`;

  return { hsl, luminance };
}

export function getThemeStyle(themeColor: ThemeColor | null | undefined) {
  const lightHex =
    typeof themeColor === 'string'
      ? normalizeRgbHex(themeColor)
      : normalizeRgbHex(themeColor?.light);
  if (!lightHex) return '';

  const primary = getHslAndLuminance(lightHex);

  const darkContentLuminance = 0.0092;
  const lightContrast = (1 + 0.05) / (primary.luminance + 0.05);
  const darkContrast =
    (Math.max(primary.luminance, darkContentLuminance) + 0.05) /
    (Math.min(primary.luminance, darkContentLuminance) + 0.05);
  // Pick readable button/header text for the manifest color.
  const primaryContent = darkContrast >= lightContrast ? '#0f172a' : '#ffffff';

  // Dark-mode shades are derived from --color-primary in CSS so the product hue stays consistent.
  return `--color-primary: ${primary.hsl}; --color-primary-content: ${primaryContent};`;
}
