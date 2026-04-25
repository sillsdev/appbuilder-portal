<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/google-play/components/LocaleSelector.svelte';
  import { m } from '$lib/google-play/paraglide/messages';
  import { type Locale, localizeHref } from '$lib/google-play/paraglide/runtime';
  import { DEFAULT_ICON, getThemeVariables } from '$lib/utils/theme';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let turnstileToken: string | null = null;

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  const currentLocale = app.language as Locale;
  const localeFallbacks = data.fallbacks;
  const confirmEmailStorageKey = `udm-confirm-email:${app.id}`;
  let themeColor = $state(app.themeColor ?? '#0e795b');

  const {
    form: deleteForm,
    enhance: deleteEnhance,
    message: deleteMessage,
    delayed: deleteDelayed,
    errors: deleteErrors
  } = superForm(data.form, {
    onSubmit: ({ cancel, formData }) => {
      if (!turnstileToken) {
        const tokenFromForm = formData.get('cf-turnstile-response');
        const tokenFromWidget = window.turnstile?.getResponse?.();
        const token =
          typeof tokenFromForm === 'string' && tokenFromForm.length > 0
            ? tokenFromForm
            : tokenFromWidget;
        if (typeof token === 'string' && token.length > 0) {
          turnstileToken = token;
        }
      }

      if (!turnstileToken) {
        $deleteMessage = { error: m.udm_alert_verify_human() };
        cancel();
        return;
      }

      $deleteForm.turnstileToken = turnstileToken;
      formData.set('turnstileToken', turnstileToken);
    },
    onUpdated: ({ form }) => {
      if (
        form.valid &&
        form.message?.step === 'verify' &&
        typeof form.message?.email === 'string'
      ) {
        sessionStorage.setItem(confirmEmailStorageKey, form.message.email);
        window.location.assign(
          localizeHref(`/user-data/${app.id}/confirm`, { locale: currentLocale })
        );
        return;
      }

      if (form.message?.error) {
        window.turnstile?.reset?.();
        turnstileToken = null;
        $deleteForm.turnstileToken = '';
      }
    }
  });

  let themeVars = $derived(getThemeVariables(themeColor));
  let themeStyle = $derived(
    `--color-primary: ${themeVars.primaryHex}; --color-primary-content: ${themeVars.primaryContentHex}; --udm-shell-light: ${themeVars.shellLightHex}; --udm-shell-dark: ${themeVars.shellDarkHex}; --udm-header-light: ${themeVars.headerLightHex}; --udm-header-dark: ${themeVars.headerDarkHex}; word-break: break-word; overflow-wrap: anywhere;`
  );

  onMount(() => {
    window.handleTurnstileSuccess = (token: string) => {
      turnstileToken = token;
      $deleteForm.turnstileToken = token;
    };

    return () => {
      delete window.handleTurnstileSuccess;
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
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1 ps-3 pe-2" style="border-inline-start: 4px solid currentColor;">
          <h1 class="text-2xl font-bold tracking-tight leading-none break-words">
            {m.udm_manage_data_title()}
          </h1>
          <p class="mt-1 text-xs leading-tight text-base-content/75 break-words">
            {m.udm_manage_data_description()}
          </p>
        </div>
        <div class="max-w-full shrink-0 rounded-xl bg-neutral p-1 shadow-sm">
          <LocaleSelector
            current={currentLocale}
            l10nMap={data.l10nMap}
            locales={app.languages as Locale[]}
            fallbacks={localeFallbacks}
          />
        </div>
      </div>
    </div>

    <div class="px-5 pb-4 mt-2 flex items-start gap-4">
      <div class="avatar">
        <div class="w-14 rounded-2xl shadow-sm bg-primary/5 p-0.5">
          <img src={iconSrc} alt={m.app_icon_alt()} />
        </div>
      </div>
      <div class="min-w-0 grow text-start">
        <h2 class="text-lg font-bold tracking-tight leading-tight break-words">{app.name}</h2>
        <p class="mt-1 text-sm text-primary font-bold leading-tight break-words">{app.developer}</p>
      </div>
    </div>

    <div class="px-5">
      <a
        class="btn btn-ghost btn-sm border border-base-300 mb-4 btn-block"
        href={localizeHref(`/user-data/${app.id}/about`, { locale: currentLocale })}
      >
        {m.udm_about_app()}
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm card-bordered">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">{m.udm_deletion_request_title()}</h2>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              {m.udm_deletion_request_description_1()}
            </p>
            <p class="mt-1 text-xs leading-relaxed text-base-content/80" style="text-indent: 10px;">
              {m.udm_deletion_request_description_2()}
            </p>
          </div>

          <form method="POST" action="?/sendCode" use:deleteEnhance class="space-y-4">
            <input type="hidden" name="productId" bind:value={$deleteForm.productId} />
            <input type="hidden" name="turnstileToken" bind:value={$deleteForm.turnstileToken} />

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
                bind:value={$deleteForm.email}
              />
              <label class="label pt-1 pb-0" for="email">
                <span class="label-text-alt text-[10px] text-base-content/70">
                  {m.udm_email_hint()}
                </span>
              </label>
              {#if $deleteErrors.email}
                <span class="text-error text-xs leading-tight">{$deleteErrors.email[0]}</span>
              {/if}
            </div>

            <div class="form-control">
              <p class="label pb-1 pt-0">
                <span
                  class="label-text text-xs font-bold uppercase tracking-wide text-base-content/70"
                >
                  {m.udm_deletion_scope_label()}
                </span>
              </p>
              <div class="flex flex-col gap-3 mt-1">
                <label
                  class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0"
                >
                  <input
                    type="radio"
                    name="deletionType"
                    class="radio radio-primary radio-sm mt-1 shrink-0 border-2 border-black bg-white text-black dark:border-white dark:bg-transparent dark:text-white"
                    value="data"
                    bind:group={$deleteForm.deletionType}
                  />
                  <div class="min-w-0">
                    <span
                      class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
                    >
                      {m.udm_delete_data_label()}
                    </span>
                    <p
                      class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                    >
                      {m.udm_delete_data_description()}
                    </p>
                  </div>
                </label>
                <label
                  class="label cursor-pointer items-start justify-start gap-3 p-0 group min-w-0"
                >
                  <input
                    type="radio"
                    name="deletionType"
                    value="account"
                    bind:group={$deleteForm.deletionType}
                    class="radio radio-primary radio-sm mt-1 shrink-0 border-2 border-black bg-white text-black dark:border-white dark:bg-transparent dark:text-white"
                  />
                  <div class="min-w-0">
                    <span
                      class="label-text font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
                    >
                      {m.udm_delete_account_label()}
                    </span>
                    <p
                      class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                    >
                      {m.udm_delete_account_description()}
                    </p>
                  </div>
                </label>
                <p class="mt-0.5 text-xs leading-tight text-base-content/75">
                  {m.udm_deletion_warning()}
                </p>
              </div>
            </div>

            <div class="rounded-lg border border-base-300 bg-base-200 p-4">
              <div class="mb-2 text-[10px] font-bold uppercase tracking-wide text-base-content/70">
                {m.udm_items_to_be_removed_title()}
              </div>
              <ul class="list-disc list-inside space-y-1 text-xs text-base-content/80">
                {#each m.udm_items_to_be_removed_list().split('\n').filter(Boolean) as item}
                  <li>{item}</li>
                {/each}
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
              {#if $deleteErrors.turnstileToken}
                <span class="mt-2 text-error text-xs leading-tight">
                  {$deleteErrors.turnstileToken[0]}
                </span>
              {/if}
            </div>

            <button
              class="btn btn-primary w-full border border-primary/20 shadow-sm"
              type="submit"
              disabled={$deleteDelayed}
            >
              {#if $deleteDelayed}
                <span class="loading loading-spinner"></span>
              {:else}
                {m.udm_send_verification_code()}
              {/if}
            </button>

            {#if $deleteMessage?.error}
              <p class="text-error text-xs leading-tight">{$deleteMessage.error}</p>
            {/if}
          </form>
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
