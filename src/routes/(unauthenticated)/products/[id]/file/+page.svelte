<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/components/LocaleSelector.svelte';
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

  function hexToDaisyHSL(hex: string) {
    const clean = hex.replace('#', '').trim();
    const normalized =
      clean.length === 3 ? clean.split('').map((ch) => ch + ch).join('') : clean;
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

	  function hexToRgb(hex: string) {
	    const clean = hex.replace('#', '');
	    const int = Number.parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
	    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
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

	  function lightenColor(hex: string, amount = 0.9) {
	    const { r, g, b } = hexToRgb(hex);
	    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
	    return rgbToHex(mix(r), mix(g), mix(b));
	  }

	  function darkenColor(hex: string, amount = 0.25) {
	    const { r, g, b } = hexToRgb(hex);
	    const mult = 1 - amount;
	    return rgbToHex(Math.round(r * mult), Math.round(g * mult), Math.round(b * mult));
	  }

	  function rgbToHex(r: number, g: number, b: number) {
	    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
	  }

	  function getButtonBgHex(primary: string) {
	    const lum = getRelativeLuminance(primary);
	    if (lum > 0.8) return darkenColor(primary, 0.5);
	    if (lum > 0.65) return darkenColor(primary, 0.28);
	    return primary;
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
          // Canvas can throw on cross-origin images without proper CORS headers.
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
	  const lightBgHex = $derived(lightenColor(primaryHex, 0.92));
	  const buttonBgHex = $derived(getButtonBgHex(primaryHex));
	  const buttonTextHex = $derived(getReadableTextHex(buttonBgHex));

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary', primaryHex);
      document.documentElement.style.setProperty('--color-primary-content', primaryContentHex);
      document.documentElement.style.setProperty('--p', primaryHSL);
      document.documentElement.style.setProperty('--pf', primaryHSL);
      document.documentElement.style.setProperty('--pc', primaryContentHSL);
      document.documentElement.style.setProperty('--color-base-100', '#ffffff');
      document.documentElement.style.setProperty('--color-base-200', '#f5f7fa');
      document.documentElement.style.setProperty('--color-base-300', '#e5e7eb');
      document.documentElement.style.setProperty('--color-base-content', '#1f2937');
      document.documentElement.style.setProperty('--outer-bg', lightBgHex);
      document.documentElement.style.setProperty('--root-bg', lightBgHex);
    }
  });

  onMount(() => {
    if (!app.themeColor) {
      deriveColorFromIcon(iconSrc).then((hex) => {
        themeColor = hex;
      });
    }
  });
</script>

<svelte:head>
  <style>
    :global(html),
    :global(body) {
      background-color: var(--outer-bg, #f5f7fa) !important;
      min-height: 100%;
    }
  </style>
</svelte:head>

		<div
		  class="min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
		  style="
		    --color-primary: {primaryHex};
	    --color-primary-content: {primaryContentHex};
	    --color-base-100: #ffffff;
    --color-base-200: #f5f7fa;
    --color-base-300: #e5e7eb;
    --color-base-content: #1f2937;
    --p: {primaryHSL};
    --pf: {primaryHSL};
    --pc: {primaryContentHSL};
    --b1: 0 0% 100%;
    --b2: 210 20% 98%;
    --bc: 220 13% 18%;
    word-break: break-word;
    overflow-wrap: anywhere;"
	>
		  <div class="w-full bg-white min-h-screen sm:max-w-xl sm:mx-auto">
		    <div class="px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4 bg-[#eef3f3]">
		      <div class="relative">
		        <div class="min-w-0 border-l-4 border-black pl-3 pr-16">
		          <h1 class="text-2xl font-bold tracking-tight leading-none">{m.udm_manage_title()}</h1>
		          <p class="text-xs opacity-60 leading-tight pl-8 mt-0">{m.udm_manage_subtitle()}</p>
		        </div>
		        <div class="absolute top-0 right-0 rounded-xl bg-slate-900/70 p-1">
		          <LocaleSelector />
		        </div>
		      </div>
		    </div>

	    <div class="px-5 pb-4 mt-2 flex items-start gap-4">
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

    <div class="px-5">
      <a
        class="btn btn-ghost btn-sm border border-base-300 mb-4 w-full justify-center"
        href="./file/about"
      >
        {m.udm_about_button()}
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">{m.udm_deletion_request_title()}</h2>
            <p class="text-xs opacity-60 mt-1 leading-relaxed" style="text-indent: 10px;">
              {m.udm_deletion_intro_1()}
            </p>
            <p class="text-xs opacity-60 mt-1 leading-relaxed" style="text-indent: 10px;">
              {m.udm_deletion_intro_2()}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label pb-1 pt-0" for="email">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                {m.udm_email_label()}
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder={m.udm_email_placeholder()}
              class="input input-bordered w-full text-base sm:text-sm h-11 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              name="email"
            />
            <label class="label pt-1 pb-0" for="email">
              <span class="label-text-alt text-[10px] opacity-60">
                {m.udm_email_help()}
              </span>
            </label>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                {m.udm_scope_label()}
              </span>
	            </p>
	            <div class="flex flex-col gap-3 mt-1">
	              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0">
	                <input
	                  type="radio"
	                  name="deletionType"
	                  class="radio radio-primary radio-sm mt-1"
	                  checked
	                />
	                <div class="min-w-0">
	                  <span
	                    class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
	                  >
	                    {m.udm_scope_data_title()}
	                  </span>
	                  <p class="text-xs opacity-60 leading-tight mt-0.5 whitespace-normal break-words">
	                    {m.udm_scope_data_desc()}
	                  </p>
	                </div>
	              </label>
	              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0">
	                <input type="radio" name="deletionType" class="radio radio-primary radio-sm mt-1" />
	                <div class="min-w-0">
	                  <span
	                    class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
	                  >
	                    {m.udm_scope_account_title()}
	                  </span>
	                  <p class="text-xs opacity-60 leading-tight mt-0.5 whitespace-normal break-words">
	                    {m.udm_scope_account_desc()}
	                  </p>
	                </div>
	              </label>
              <p class="text-xs opacity-60 leading-tight mt-0.5">
                {m.udm_scope_warning()}
              </p>
            </div>
          </div>

          <div class="bg-base-200/60 rounded-lg p-4 border border-base-200">
            <div class="text-[10px] font-bold mb-2 uppercase tracking-wide opacity-50">
              {m.udm_items_removed_title()}
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs opacity-60">
              <li>{m.udm_item_bookmarks()}</li>
              <li>{m.udm_item_notes()}</li>
              <li>{m.udm_item_highlights()}</li>
              <li>{m.udm_item_reading_progress()}</li>
            </ul>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                {m.udm_verification_label()}
              </span>
            </p>
            <div
              class="rounded-btn border border-base-300 bg-base-200/30 h-14 flex items-center justify-center text-xs opacity-50"
            >
              {m.udm_captcha_placeholder()}
            </div>
          </div>

	          <button
	            class="btn w-full no-animation border border-black/10 shadow-sm"
	            style="background-color: #0f172a; color: #ffffff;"
	            type="button"
	          >
	            {m.udm_send_code()}
	          </button>
        </div>
      </div>

      <p class="text-xs opacity-50 text-center mt-4">
        {m.udm_footer_text({ appName: app.name })}
        <a class="link link-primary no-underline hover:underline" href="/support">
          {m.udm_contact_support()}
        </a>
        .
      </p>
    </div>
  </div>
</div>
