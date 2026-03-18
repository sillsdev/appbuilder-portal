<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const DEFAULT_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjcyIiB5Mj0iNzIiIGdyYWRpZW50VW5pdHM9InVzZXRTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzBlNzk1YiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxMmEzN2EiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgcng9IjE2IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTIwIDQ4bDgtMjQgOCAxNiA4LTEyIDggMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Rya2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  let themeColor = $state(app.themeColor ?? '#0e795b');

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

  function hexToRgb(hex: string) {
    const clean = hex.replace('#', '');
    const int = Number.parseInt(clean.length === 3 ? clean.replace(/./g, '$&$&') : clean, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
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

  let primaryHSL = $derived(hexToDaisyHSL(themeColor));
  let primaryContentHSL = $derived(hexToDaisyHSL(getReadableTextHex(themeColor)));
  let primaryHex = $derived(themeColor);
  let primaryContentHex = $derived(getReadableTextHex(themeColor));
  let lightBgHex = $derived(lightenColor(themeColor, 0.92));

  // This is Svelte 5, do we support this yet?
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

  const initialEmail = data.email ?? '';
  let step = $state(initialEmail ? 'code' : 'email');
  let email = $state(initialEmail);
  let code = $state('');
  let error = $state('');
  let loading = $state(false);

  const handleSendCode: SubmitFunction = () => {
    loading = true;
    error = '';
    return async ({ result }) => {
      loading = false;
      if (result.type === 'success') {
        step = 'code';
      } else if (result.type === 'failure') {
        const message = (result.data as { message?: string } | undefined)?.message;
        error = message || m.udm_confirm_send_code_failed();
      }
    };
  };

  const handleVerifyCode: SubmitFunction = () => {
    loading = true;
    error = '';
    return async ({ result }) => {
      loading = false;
      if (result.type === 'success') {
        step = 'verified';
      } else if (result.type === 'redirect') {
        step = 'verified';
      } else if (result.type === 'failure') {
        const message = (result.data as { message?: string } | undefined)?.message;
        error = message || m.udm_confirm_verify_failed();
      }
    };
  };

  onMount(() => {
    if (!app.themeColor) {
      deriveColorFromIcon(iconSrc).then((hex) => {
        themeColor = hex;
      });
    }
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
              src={iconSrc}
              alt={`${app.name} icon`}
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
          {m.udm_confirm_verified()}
        {:else if step === 'code'}
          {m.udm_confirm_check_email()}
        {:else}
          {m.udm_confirm_enter_email()}
        {/if}
      </h1>
    </div>

    <div class="p-8">
      {#if step === 'email'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.udm_confirm_enter_email_desc()}
        </p>

        <form method="POST" action="?/sendCode" use:enhance={handleSendCode}>
          <div class="mb-6 flex flex-col gap-2">
            <input
              type="email"
              name="email"
              bind:value={email}
              placeholder={m.udm_confirm_email_placeholder()}
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
              {m.udm_confirm_send_code()}
            {/if}
          </button>
        </form>
      {:else if step === 'code'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.udm_confirm_code_sent({ email })}
        </p>

        <form method="POST" action="?/verifyCode" use:enhance={handleVerifyCode}>
          <input type="hidden" name="email" value={email} />
          <div class="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="code"
              bind:value={code}
              placeholder={m.udm_confirm_code_placeholder()}
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
              {m.udm_confirm_verify_code()}
            {/if}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-base-content/60">
          <p>
            {m.udm_confirm_didnt_receive()}
            <button
              type="button"
              onclick={() => (step = 'email')}
              class="link link-primary font-bold no-underline hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {m.udm_confirm_change_email()}
            </button>
          </p>
        </div>
      {:else if step === 'verified'}
        <div class="text-center flex flex-col gap-4">
          <p class="text-lg font-bold text-base-content">{m.udm_confirm_complete()}</p>
          <p class="text-base-content/70 text-[0.95rem]">
            {m.udm_confirm_submitted()}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
