<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/google-play/components/LocaleSelector.svelte';
  import type { Locale } from '$lib/google-play/paraglide/runtime';
  import {
    DEFAULT_ICON,
    applyThemeToDocument,
    deriveColorFromIcon,
    getThemeVariables
  } from '$lib/utils/theme';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let turnstileToken: string | null = null;
  let deletionType = $state<'data' | 'account'>('data');

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  const currentLocale = data.locale as Locale;
  const localeFallbacks = $derived(
    new Map(Array.from(data.fallbacks.entries()).map(([key, value]) => [key, value ?? key]))
  );
  const confirmEmailStorageKey = `udm-confirm-email:${app.id}`;
  let themeColor = $state(app.themeColor ?? '#0e795b');

  async function submitForm() {
    if (!turnstileToken) {
      const tokenFromWidget = window.turnstile?.getResponse?.();
      if (typeof tokenFromWidget === 'string' && tokenFromWidget.length > 0) {
        turnstileToken = tokenFromWidget;
      }
    }

    if (!turnstileToken) {
      alert('Please verify you are human.');
      return;
    }

    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const email = emailInput?.value?.trim();
    if (!email || !emailInput?.checkValidity()) {
      alert('Please enter a valid email address.');
      emailInput?.focus();
      return;
    }

    let res: Response;
    try {
      res = await fetch('/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: turnstileToken, productId: app.id, deletionType })
      });
    } catch {
      alert('Verification failed. Please try again.');
      return;
    }

    const responseData = await res.json().catch(() => null);
    if (!res.ok || !responseData?.success) {
      alert('Verification failed. Please try again.');
      window.turnstile?.reset?.();
      turnstileToken = null;
      return;
    }

    sessionStorage.setItem(confirmEmailStorageKey, email);
    window.location.assign(`/user-data/confirm?${data.udmQuery}`);
  }

  let themeVars = $derived(getThemeVariables(themeColor));
  let themeStyle = $derived(
    `--color-primary: ${themeVars.primaryHex}; --color-primary-content: ${themeVars.primaryContentHex}; --p: ${themeVars.primaryHSL}; --pf: ${themeVars.primaryHSL}; --pc: ${themeVars.primaryContentHSL}; --udm-shell-light: ${themeVars.shellLightHex}; --udm-shell-dark: ${themeVars.shellDarkHex}; --udm-header-light: ${themeVars.headerLightHex}; --udm-header-dark: ${themeVars.headerDarkHex}; word-break: break-word; overflow-wrap: anywhere;`
  );

  $effect(() => {
    applyThemeToDocument(themeColor);
  });

  onMount(() => {
    if (!app.themeColor) {
      deriveColorFromIcon(iconSrc, themeColor).then((hex) => (themeColor = hex));
    }

    window.handleTurnstileSuccess = (token: string) => {
      turnstileToken = token;
    };
  });
</script>

<svelte:head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  <style>
    :global(html),
    :global(body) {
      min-height: 100%;
    }
  </style>
</svelte:head>

<div
  class="udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
  style={themeStyle}
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4">
      <div class="relative">
        <div class="min-w-0 border-l-4 border-base-content pl-3 pr-16">
          <h1 class="text-2xl font-bold tracking-tight leading-none">Manage my data</h1>
          <p class="mt-0 pl-8 text-xs leading-tight text-base-content/75">
            Request account or data deletion for this app.
          </p>
        </div>
        <div class="absolute top-0 right-0 rounded-xl bg-neutral p-1 shadow-sm">
          <LocaleSelector
            current={currentLocale}
            l10nMap={data.l10nMap}
            fallbacks={localeFallbacks}
          />
        </div>
      </div>
    </div>

    <div class="px-5 pb-4 mt-2 flex items-start gap-4">
      <div class="avatar">
        <div class="w-14 rounded-2xl shadow-sm bg-primary/5 p-0.5">
          <img src={iconSrc} alt="App icon" />
        </div>
      </div>
      <div class="grid justify-items-start text-left gap-0">
        <h2 class="text-lg font-bold tracking-tight leading-none">{app.name}</h2>
        <p class="text-sm text-primary font-bold leading-tight ml-4">{app.developer}</p>
      </div>
    </div>

    <div class="px-5">
      <a
        class="btn btn-ghost btn-sm border border-base-300 mb-4 btn-block"
        href={`/user-data/about?${data.udmQuery}`}
      >
        About this app
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm card-bordered">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">Deletion Request</h2>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              Enter the email address associated with your account to request data deletion. We will
              send a one-time verification code to confirm your identity.
            </p>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              Once confirmed, your request will be processed within 30 days in accordance with our
              data retention obligations. Deletions are permanent and cannot be undone. Some
              information may be retained where required by law or for compliance purposes.
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label pb-1 pt-0" for="email">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                Email
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              class="input input-bordered w-full text-base sm:text-sm h-11 focus:border-primary focus:outline-primary"
              name="email"
            />
            <label class="label pt-1 pb-0" for="email">
              <span class="label-text-alt text-[10px] text-base-content/70">
                Use the email associated with your account.
              </span>
            </label>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                Deletion Scope
              </span>
            </p>
            <div class="flex flex-col gap-3 mt-1">
              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0">
                <input
                  type="radio"
                  name="deletionType"
                  class="radio radio-primary radio-sm mt-1 shrink-0 border-2 border-black bg-white text-black dark:border-white dark:bg-transparent dark:text-white"
                  value="data"
                  bind:group={deletionType}
                />
                <div class="min-w-0">
                  <span
                    class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
                  >
                    Delete my data
                  </span>
                  <p
                    class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                  >
                    Your login remains active, but your personal content will be permanently
                    deleted.
                  </p>
                </div>
              </label>
              <label class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0">
                <input
                  type="radio"
                  name="deletionType"
                  value="account"
                  bind:group={deletionType}
                  class="radio radio-primary radio-sm mt-1 shrink-0 border-2 border-black bg-white text-black dark:border-white dark:bg-transparent dark:text-white"
                />
                <div class="min-w-0">
                  <span
                    class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
                  >
                    Delete my account and all associated data
                  </span>
                  <p
                    class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                  >
                    This will permanently remove your login and saved content.
                  </p>
                </div>
              </label>
              <p class="mt-0.5 text-xs leading-tight text-base-content/75">
                Warning: Deletions are permanent and cannot be undone. Some data may be retained for
                legal or compliance purposes.
              </p>
            </div>
          </div>

          <div class="rounded-lg border border-base-300 bg-base-200 p-4">
            <div class="mb-2 text-[10px] font-bold uppercase tracking-wide text-base-content/70">
              Items to be removed
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs text-base-content/80">
              <li>Bookmarks</li>
              <li>Notes</li>
              <li>Highlights</li>
              <li>Reading plan progress</li>
            </ul>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                Verification
              </span>
            </p>
            <div class="mt-2">
              <div
                class="cf-turnstile"
                data-sitekey="0x4AAAAAACW5LHZjYD-EBWMs"
                data-callback="handleTurnstileSuccess"
              ></div>
            </div>
          </div>

          <button
            class="btn btn-primary w-full border border-primary/20 shadow-sm"
            type="button"
            onclick={submitForm}
          >
            Send verification code
          </button>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-base-content/70">
        This page is provided for {app.name} on Google Play. Need help?
        <a class="link link-primary no-underline hover:underline" href="/support">
          Contact support
        </a>
        .
      </p>
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
