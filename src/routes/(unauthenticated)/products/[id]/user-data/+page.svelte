<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/components/LocaleSelector.svelte';
  import { m } from '$lib/paraglide/messages';
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
  let themeColor = $state(app.themeColor ?? '#0e795b');

  async function submitForm() {
    if (!turnstileToken) {
      const tokenFromWidget = window.turnstile?.getResponse?.();
      if (typeof tokenFromWidget === 'string' && tokenFromWidget.length > 0) {
        turnstileToken = tokenFromWidget;
      }
    }

    if (!turnstileToken) {
      alert(m.udm_alert_verify_human());
      return;
    }

    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const email = emailInput?.value?.trim();
    if (!email || !emailInput?.checkValidity()) {
      alert(m.udm_alert_invalid_email());
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
      alert(m.udm_alert_verification_failed());
      return;
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(m.udm_alert_verification_failed());
      window.turnstile?.reset?.();
      turnstileToken = null;
      return;
    }

    const confirmUrl = new URL(`/products/${app.id}/confirm`, window.location.origin);
    confirmUrl.searchParams.set('email', email);
    window.location.assign(confirmUrl.toString());
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

    // Expose callback globally for Turnstile
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
          <h1 class="text-2xl font-bold tracking-tight leading-none">{m.udm_manage_title()}</h1>
          <p class="mt-0 pl-8 text-xs leading-tight text-base-content/75">
            {m.udm_manage_subtitle()}
          </p>
        </div>
        <div class="absolute top-0 right-0 rounded-xl bg-neutral p-1 shadow-sm">
          <LocaleSelector
            class={{
              dropdown: 'dropdown-end',
              label:
                'm-0 p-2 rounded-xl items-middle justify-center flex-nowrap text-neutral-content hover:text-neutral-content focus-visible:text-neutral-content',
              content: 'mt-2 border border-base-300 bg-base-100'
            }}
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
        href="./user-data/about"
      >
        {m.udm_about_button()}
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm card-bordered">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">{m.udm_deletion_request_title()}</h2>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              {m.udm_deletion_intro_1()}
            </p>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              {m.udm_deletion_intro_2()}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label pb-1 pt-0" for="email">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                {m.udm_email_label()}
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder={m.udm_email_placeholder()}
              class="input input-bordered w-full text-base sm:text-sm h-11 focus:border-primary focus:outline-primary"
              name="email"
            />
            <label class="label pt-1 pb-0" for="email">
              <span class="label-text-alt text-[10px] text-base-content/70">
                {m.udm_email_help()}
              </span>
            </label>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                {m.udm_scope_label()}
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
                    {m.udm_scope_data_title()}
                  </span>
                  <p
                    class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                  >
                    {m.udm_scope_data_desc()}
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
                    {m.udm_scope_account_title()}
                  </span>
                  <p
                    class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                  >
                    {m.udm_scope_account_desc()}
                  </p>
                </div>
              </label>
              <p class="mt-0.5 text-xs leading-tight text-base-content/75">
                {m.udm_scope_warning()}
              </p>
            </div>
          </div>

          <div class="rounded-lg border border-base-300 bg-base-200 p-4">
            <div class="mb-2 text-[10px] font-bold uppercase tracking-wide text-base-content/70">
              {m.udm_items_removed_title()}
            </div>
            <ul class="list-disc list-inside space-y-1 text-xs text-base-content/80">
              <li>{m.udm_item_bookmarks()}</li>
              <li>{m.udm_item_notes()}</li>
              <li>{m.udm_item_highlights()}</li>
              <li>{m.udm_item_reading_progress()}</li>
            </ul>
          </div>

          <div class="form-control">
            <p class="label pb-1 pt-0">
              <span
                class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
              >
                {m.udm_verification_label()}
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
            class="btn btn-primary btn-block border border-primary/20 shadow-sm"
            type="button"
            onclick={submitForm}
          >
            {m.udm_send_code()}
          </button>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-base-content/70">
        {m.udm_footer_text({ appName: app.name })}
        <a class="link link-primary no-underline hover:underline" href="/support">
          {m.udm_contact_support()}
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
