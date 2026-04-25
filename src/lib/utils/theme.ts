export const DEFAULT_ICON = '/placeholder-icon.svg';

export function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const int = Number.parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function srgbChannelToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(a: string, b: string) {
  const L1 = getRelativeLuminance(a);
  const L2 = getRelativeLuminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextHex(hex: string) {
  const light = '#ffffff';
  const dark = '#0f172a';
  return contrastRatio(hex, dark) >= contrastRatio(hex, light) ? dark : light;
}

export function lightenColor(hex: string, amount = 0.9) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return rgbToHex(mix(r), mix(g), mix(b));
}

export function mixColors(hexA: string, hexB: string, amount = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const mix = (from: number, to: number) => Math.round(from + (to - from) * amount);
  return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
}

export function hexToDaisyHSL(hex: string) {
  const clean = hex.replace('#', '').trim();
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return '0 0% 0%';

  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export function getThemeVariables(themeColor: string) {
  const primaryContentHex = getReadableTextHex(themeColor);
  return {
    primaryHex: themeColor,
    primaryContentHex,
    primaryHSL: hexToDaisyHSL(themeColor),
    primaryContentHSL: hexToDaisyHSL(primaryContentHex),
    lightBgHex: lightenColor(themeColor, 0.92),
    darkBgHex: mixColors(themeColor, '#0b1220', 0.88),
    shellLightHex: mixColors(themeColor, '#ffffff', 0.93),
    shellDarkHex: mixColors(themeColor, '#111827', 0.84),
    headerLightHex: mixColors(themeColor, '#ffffff', 0.85),
    headerDarkHex: mixColors(themeColor, '#0f172a', 0.72)
  };
}
