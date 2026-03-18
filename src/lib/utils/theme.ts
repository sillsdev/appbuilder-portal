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

export function deriveColorFromIcon(iconSrc: string, fallbackColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(fallbackColor);

      try {
        ctx.drawImage(img, 0, 0, width, height);
        const { data } = ctx.getImageData(0, 0, width, height);

        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha === 0) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (!count) return resolve(fallbackColor);
        resolve(rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count)));
      } catch {
        resolve(fallbackColor);
      }
    };

    img.onerror = () => resolve(fallbackColor);
    img.src = iconSrc;
  });
}

export function getThemeVariables(themeColor: string) {
  const primaryContentHex = getReadableTextHex(themeColor);
  return {
    primaryHex: themeColor,
    primaryContentHex,
    primaryHSL: hexToDaisyHSL(themeColor),
    primaryContentHSL: hexToDaisyHSL(primaryContentHex),
    lightBgHex: lightenColor(themeColor, 0.92)
  };
}

export function applyThemeToDocument(themeColor: string) {
  if (typeof document === 'undefined') return;
  const vars = getThemeVariables(themeColor);
  const root = document.documentElement;
  root.style.setProperty('--color-primary', vars.primaryHex);
  root.style.setProperty('--color-primary-content', vars.primaryContentHex);
  root.style.setProperty('--p', vars.primaryHSL);
  root.style.setProperty('--pf', vars.primaryHSL);
  root.style.setProperty('--pc', vars.primaryContentHSL);
  root.style.setProperty('--color-base-100', '#ffffff');
  root.style.setProperty('--color-base-200', '#f5f7fa');
  root.style.setProperty('--color-base-300', '#e5e7eb');
  root.style.setProperty('--color-base-content', '#1f2937');
  root.style.setProperty('--outer-bg', vars.lightBgHex);
  root.style.setProperty('--root-bg', vars.lightBgHex);
}
