<script lang="ts">
  import { onMount } from 'svelte';

  const BLUE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjcyIiB5Mj0iNzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzE1NjNmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzZmE5ZmYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgcng9IjE2IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTIwIDQ4bDgtMjQgOCAxNiA4LTEyIDggMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Rya2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

  const app = {
    icon: BLUE_ICON,
    name: 'Blue Sample App',
    developer: 'Azure Labs',
    themeColor: '#1563ff',
    shortDesc: 'A concise store listing blurb to confirm this page is official.',
    longDesc: `A longer store listing description for users who want details.\n\nThis is placeholder content to demonstrate layout only.`
  };

  const locales = ['en-US', 'fr-FR', 'es-419'];
  let selectedLocale = locales[0];
  let themeColor = app.themeColor;

  function hexToDaisyHSL(hex: string) {
    let c = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    c = '0x' + c.join('');
    let r = (c >> 16) & 255,
      g = (c >> 8) & 255,
      b = c & 255;
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
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

  function getReadableTextHex(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.55 ? '#0f172a' : '#ffffff';
  }

  function lightenColor(hex: string, amount = 0.9) {
    const { r, g, b } = hexToRgb(hex);
    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
    return rgbToHex(mix(r), mix(g), mix(b));
  }

  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
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
      };

      img.onerror = () => resolve(themeColor);
      img.src = iconSrc;
    });
  }

  $: primaryHSL = hexToDaisyHSL(themeColor);
  $: primaryContentHSL = hexToDaisyHSL(getReadableTextHex(themeColor));
  $: primaryHex = themeColor;
  $: primaryContentHex = getReadableTextHex(themeColor);
  $: lightBgHex = lightenColor(themeColor, 0.92);

  $: {
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
  }

  onMount(() => {
    deriveColorFromIcon(app.icon).then((hex) => {
      themeColor = hex;
    });
  });
</script>

<svelte:head>
  <style>
     :root { --outer-bg: {lightBgHex}; }
     :global(html), :global(body) { background-color: var(--outer-bg) !important; min-height: 100%; }
  </style>
</svelte:head>

<div
  class="min-h-screen w-full text-base-content font-sans antialiased break-words"
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
  <div class="max-w-xl mx-auto bg-white min-h-screen">
    <div
      class="px-5 pt-5 pb-3 grid grid-cols-[auto_1fr] gap-3 items-start"
      style="padding-top: calc(1rem + env(safe-area-inset-top)); padding-left: 45px;"
    >
      <div class="grid grid-cols-1 gap-0 border-l-4 border-black pl-0 content-start">
        <h1 class="text-2xl font-bold tracking-tight leading-none">Manage my data</h1>

        <p class="text-xs opacity-60 leading-tight -mt-3 m-9">
          Request account or data deletion for this app.
        </p>
      </div>
      <div class="ml-auto justify-self-end">
        <label class="text-[11px] uppercase tracking-wide opacity-60 font-bold block mb-1">
          Language
        </label>
        <select
          class="select select-bordered w-28 text-base sm:text-sm"
          bind:value={selectedLocale}
        >
          {#each locales as locale}
            <option value={locale}>{locale}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="px-5 pb-4 flex items-start gap-4">
      <img
        src={app.icon}
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
        href="./about"
      >
        About this app
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">Deletion Request</h2>
            <p class="text-xs opacity-60 mt-1 leading-relaxed" style="text-indent: 10px;">
              Enter the email address associated with your account to request data deletion. We’ll
              send a one-time verification code to confirm your identity.
            </p>
            <p class="text-xs opacity-60 mt-1 leading-relaxed" style="text-indent: 10px;">
              Once confirmed, your request will be processed within 30 days, in accordance with our
              data retention obligations. Deletions are permanent and cannot be undone. Some
              information may be retained where required by law or for legitimate compliance
              purposes.
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label pb-1 pt-0">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                Email
              </span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              class="input input-bordered w-full text-base sm:text-sm h-11 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              name="email"
            />
            <label class="label pt-1 pb-0">
              <span class="label-text-alt text-[10px] opacity-60">
                Use the email associated with your account.
              </span>
            </label>
          </div>

          <div class="form-control">
            <label class="label pb-1 pt-0">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                Deletion Scope
              </span>
            </label>
            <div class="flex flex-col gap-3 mt-1">
              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group">
                <input
                  type="radio"
                  name="deletionType"
                  class="radio radio-primary radio-sm mt-1"
                  checked
                />
                <div>
                  <span
                    class="label-text font-bold text-sm group-hover:text-primary transition-colors"
                  >
                    Delete my data
                  </span>
                  <p class="text-xs opacity-60 leading-tight mt-0.5">
                    Your login remains active, but your personal content will be permanently
                    deleted.
                  </p>
                </div>
              </label>
              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group">
                <input type="radio" name="deletionType" class="radio radio-primary radio-sm mt-1" />
                <div>
                  <span
                    class="label-text font-bold text-sm group-hover:text-primary transition-colors"
                  >
                    Delete my account and data
                  </span>
                  <p class="text-xs opacity-60 leading-tight mt-0.5">
                    This will permanently remove your login and saved content.
                  </p>
                </div>
              </label>
              <p class="text-xs opacity-60 leading-tight mt-0.5">
                ⚠️ Deletions are permanent and cannot be undone. Some data may be retained for legal
                or compliance purposes
              </p>
            </div>
          </div>

          <div class="bg-base-200/60 rounded-lg p-4 border border-base-200">
            <div class="text-[10px] font-bold mb-2 uppercase tracking-wide opacity-50">
              Items to be removed
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs opacity-60">
              <li>Bookmarks</li>
              <li>Notes</li>
              <li>Highlights</li>
              <li>Reading plan progress</li>
            </ul>
          </div>

          <div class="form-control">
            <label class="label pb-1 pt-0">
              <span class="label-text text-xs font-bold opacity-50 uppercase tracking-wide">
                Verification
              </span>
            </label>
            <div
              class="rounded-btn border border-base-300 bg-base-200/30 h-14 flex items-center justify-center text-xs opacity-50"
            >
              Captcha widget placeholder (Turnstile)
            </div>
          </div>

          <button class="btn btn-primary w-full text-white no-animation" type="button">
            Send verification code
          </button>
        </div>
      </div>

      <p class="text-xs opacity-50 text-center mt-4">
        This page is provided for <span class="font-bold opacity-90">{app.name}</span>
        on Google Play. Need help?
        <a class="link link-primary no-underline hover:underline" href="/support">
          Contact support
        </a>
        .
      </p>
    </div>
  </div>
</div>
