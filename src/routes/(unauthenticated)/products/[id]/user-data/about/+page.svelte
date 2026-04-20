<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const DEFAULT_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjcyIiB5Mj0iNzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzBlNzk1YiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxMmEzN2EiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgcng9IjE2IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTIwIDQ4bDgtMjQgOCAxNiA4LTEyIDggMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Rya2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  let themeColor = $state(app.themeColor ?? '#0e795b');

  function hexToRgb(hex: string) {
    const clean = hex.replace('#', '');
    const int = Number.parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function srgbChannelToLinear(channel: number) {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function getRelativeLuminance(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const R = srgbChannelToLinear(r);
    const G = srgbChannelToLinear(g);
    const B = srgbChannelToLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  function contrastRatio(a: string, b: string) {
    const L1 = getRelativeLuminance(a);
    const L2 = getRelativeLuminance(b);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function getReadableTextHex(hex: string) {
    const light = '#ffffff';
    const dark = '#0f172a';
    return contrastRatio(hex, dark) >= contrastRatio(hex, light) ? dark : light;
  }

  function mixColors(hexA: string, hexB: string, amount = 0.5) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const mix = (from: number, to: number) => Math.round(from + (to - from) * amount);
    return rgbToHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
  }

  function hexToDaisyHSL(hex: string) {
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

  function deriveColorFromIcon(iconSrc: string): Promise<string> {
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
        if (!ctx) return resolve(themeColor);

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

          if (!count) return resolve(themeColor);
          resolve(rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count)));
        } catch {
          resolve(themeColor);
        }
      };

      img.onerror = () => resolve(themeColor);
      img.src = iconSrc;
    });
  }

  const primaryHex = $derived(themeColor);
  const primaryContentHex = $derived(getReadableTextHex(primaryHex));
  const primaryHSL = $derived(hexToDaisyHSL(primaryHex));
  const primaryContentHSL = $derived(hexToDaisyHSL(primaryContentHex));
  const shellLightHex = $derived(mixColors(primaryHex, '#ffffff', 0.93));
  const shellDarkHex = $derived(mixColors(primaryHex, '#111827', 0.84));
  const headerLightHex = $derived(mixColors(primaryHex, '#ffffff', 0.85));
  const headerDarkHex = $derived(mixColors(primaryHex, '#0f172a', 0.72));
  const themeStyle = $derived(
    `--color-primary: ${primaryHex}; --color-primary-content: ${primaryContentHex}; --p: ${primaryHSL}; --pf: ${primaryHSL}; --pc: ${primaryContentHSL}; --udm-shell-light: ${shellLightHex}; --udm-shell-dark: ${shellDarkHex}; --udm-header-light: ${headerLightHex}; --udm-header-dark: ${headerDarkHex};`
  );

  onMount(() => {
    if (!app.themeColor) {
      deriveColorFromIcon(iconSrc).then((hex) => (themeColor = hex));
    }
  });
</script>

<div
  class="udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
  style={themeStyle}
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-8 pb-4 flex items-start gap-4">
      <img
        src={iconSrc}
        alt="App icon"
        class="w-14 h-14 rounded-2xl shadow-sm bg-primary/5 p-0.5"
      />
      <div class="grid justify-items-start text-left gap-0">
        <h2 class="text-lg font-bold tracking-tight leading-none">{app.name}</h2>

        <p class="text-sm text-primary font-bold leading-tight ml-4">{app.developer}</p>
      </div>
    </div>
    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body space-y-3">
          <h2 class="card-title text-lg font-bold">{m.udm_about_title()}</h2>
          <p class="text-sm leading-relaxed text-base-content/80">{app.shortDesc}</p>

          <details class="group">
            <summary
              class="list-none text-sm font-bold text-primary cursor-pointer hover:underline flex items-center gap-2 select-none"
            >
              {m.udm_show_more()}
            </summary>
            <div class="pt-3 text-sm whitespace-pre-line leading-relaxed text-base-content/80">
              {app.longDesc}
            </div>
          </details>
        </div>
      </div>

      <a
        class="btn w-full mt-6 border border-primary/20 text-black shadow-sm dark:text-white"
        href="./"
        style="background-color: var(--color-primary);"
      >
        {m.udm_back_manage()}
      </a>
    </div>
  </div>
</div>

<style>
  .udm-shell {
    background-color: var(--udm-shell-light);
  }

  .udm-header {
    background-color: var(--udm-header-light);
  }

  :global([data-theme='dark']) .udm-shell {
    background-color: var(--udm-shell-dark);
  }

  :global([data-theme='dark']) .udm-header {
    background-color: var(--udm-header-dark);
  }
</style>
