<script lang="ts">
  import Icon from '@iconify/svelte';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';

  // TODO: This should pull from whatever product ID. Implement based off of the initial page for this
  const BLUE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjcyIiB5Mj0iNzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzE1NjNmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzZmE5ZmYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgcng9IjE2IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTIwIDQ4bDgtMjQgOCAxNiA4LTEyIDggMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Rya2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

    // TODO: This should pull from whatever product ID. Implement based on initial email page for this.
  const app = {
    icon: BLUE_ICON,
    name: 'Blue Sample App',
    developer: 'Azure Labs',
    themeColor: '#1563ff',
    shortDesc: 'A concise store listing blurb to confirm this page is official.',
    longDesc: `A longer store listing description for users who want details.

This is placeholder content to demonstrate layout only.`
  };

  let themeColor = $state(app.themeColor);

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
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
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

  let primaryHSL = $derived(hexToDaisyHSL(themeColor));
  let primaryContentHSL = $derived(hexToDaisyHSL(getReadableTextHex(themeColor)));
  let primaryHex = $derived(themeColor);
  let primaryContentHex = $derived(getReadableTextHex(themeColor));
  let lightBgHex = $derived(lightenColor(themeColor, 0.92));

  $effect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', primaryHex);
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

  let step = $state('email');
  let email = $state('');
  let code = $state('');
  let error = $state('');
  let loading = $state(false);
  let redirectUrl = $state('');

  const handleSendCode = () => {
    loading = true;
    error = '';
    return async ({ result }: any) => {
      loading = false;
      if (result.type === 'success') {
        step = 'code';
      } else if (result.type === 'failure') {
        error = result.data?.message || 'Failed to send code. Please try again.';
      }
    };
  };

  const handleVerifyCode = () => {
    loading = true;
    error = '';
    return async ({ result }: any) => {
      loading = false;
      if (result.type === 'success') {
        step = 'verified';
      } else if (result.type === 'redirect') {
        step = 'verified';
        redirectUrl = result.location;
      } else if (result.type === 'failure') {
        error = result.data?.message || 'Invalid code. Please check your email and try again.';
      }
    };
  };

  onMount(() => {
    deriveColorFromIcon(app.icon).then((hex) => {
      themeColor = hex;
    });
  });
</script>

<div
  class="min-h-screen flex items-center justify-center bg-base-200 font-sans p-4"
  style="background-color: var(--outer-bg)"
>
  <div class="card bg-base-100 w-full max-w-[400px] shadow-xl overflow-hidden rounded-lg">
    <div class="bg-primary p-10 px-8 text-center text-primary-content">
      <div class="flex justify-center gap-4 mb-4">
        {#if step !== 'verified'}
          <div class="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">
            <img
              src={app.icon}
              alt="App icon"
              class="w-12 h-12 rounded-2xl shadow-sm bg-primary/5 p-0.5"
            />
          </div>
        {/if}
        <div class="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">
          {#if step === 'verified'}
            <Icon icon="mdi:check-circle" width="48" />
          {:else}
            <Icon icon="mdi:email-lock" width="48" />
          {/if}
        </div>
      </div>
      <h1 class="m-0 text-2xl font-bold">
        {#if step === 'verified'}
          Verified
        {:else if step === 'code'}
          Check your email
        {:else}
          Enter your email
        {/if}
      </h1>
    </div>

    <div class="p-8">
      {#if step === 'email'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          Enter your email address to receive a verification code.
        </p>

        <form method="POST" action="?/" use:enhance={handleSendCode}>
          <div class="mb-6 flex flex-col gap-2">
            <input
              type="email"
              name="email"
              bind:value={email}
              placeholder="name@example.com"
              required
              class="input input-bordered w-full h-14 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if error}
              <span class="text-error text-sm text-center mt-1">{error}</span>
            {/if}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full text-white no-animation h-14"
            disabled={loading}
          >
            {#if loading}
              <span class="loading loading-spinner"></span>
            {:else}
              Send Code
            {/if}
          </button>
        </form>
      {:else if step === 'code'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          We've sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to complete
          the process.
        </p>

        <form method="POST" action="?/verifyCode" use:enhance={handleVerifyCode}>
          <input type="hidden" name="email" value={email} />
          <div class="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="code"
              bind:value={code}
              placeholder="000000"
              maxlength="6"
              autocomplete="one-time-code"
              required
              class="input input-bordered w-full h-16 text-[2rem] text-center tracking-[0.5rem] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if error}
              <span class="text-error text-sm text-center mt-1">{error}</span>
            {/if}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full text-white no-animation h-14"
            disabled={loading}
          >
            {#if loading}
              <span class="loading loading-spinner"></span>
            {:else}
              Verify Code
            {/if}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-base-content/60">
          <p>
            Didn't receive the code?
            <button
              type="button"
              onclick={() => (step = 'email')}
              class="link link-primary font-bold no-underline hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Change Email
            </button>
          </p>
        </div>
      {:else if step === 'verified'}
        <div class="text-center flex flex-col gap-4">
          <p class="text-lg font-bold text-base-content">Verification Complete</p>
          <p class="text-base-content/70 text-[0.95rem]">
            The process has been completed and your information was removed.
          </p>
          <button
            class="btn btn-outline btn-primary mt-4 rounded-xl"
            onclick={() =>
              redirectUrl ? (window.location.href = redirectUrl) : window.location.reload()}
          >
            Done
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
