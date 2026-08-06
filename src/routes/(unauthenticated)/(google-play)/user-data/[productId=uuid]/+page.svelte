<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { env } from '$env/dynamic/public';
  import { confirmationStorageKey, deletionTypes } from '$lib/google-play';
  import LocaleSelector from '$lib/google-play/components/LocaleSelector.svelte';
  import { m } from '$lib/google-play/paraglide/messages';
  import { type Locale, localizeHref } from '$lib/google-play/paraglide/runtime';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let turnstileToken: string | null = null;
  let deleteSubmitAttempted = $state(false);

  const currentLocale = data.app.language as Locale;
  const confirmEmailStorageKey = confirmationStorageKey(data.app.id);

  const { form, enhance, message, delayed, errors } = superForm(data.form, {
    onSubmit: ({ cancel, formData }) => {
      deleteSubmitAttempted = true;

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
        $message = { error: m.alert_verify_human() };
        cancel();
        return;
      }

      $form.turnstileToken = turnstileToken;
      formData.set('turnstileToken', turnstileToken);
    },
    onUpdated: ({ form: result }) => {
      if (
        result.valid &&
        result.message?.step === 'verify' &&
        typeof result.message?.email === 'string'
      ) {
        sessionStorage.setItem(confirmEmailStorageKey, result.message.email);
        window.location.assign(
          localizeHref(`/user-data/${data.app.id}/confirm`, { locale: currentLocale })
        );
        return;
      }

      if (result.message?.error) {
        window.turnstile?.reset?.();
        turnstileToken = null;
        $form.turnstileToken = '';
      }
    }
  });

  onMount(() => {
    window.handleTurnstileSuccess = (token: string) => {
      turnstileToken = token;
      $form.turnstileToken = token;
      clearDeleteError('turnstileToken');
      $message = undefined;
    };

    return () => {
      delete window.handleTurnstileSuccess;
    };
  });

  function clearDeleteError(field: 'email' | 'turnstileToken') {
    if ($errors[field]) {
      $errors = { ...$errors, [field]: undefined };
    }
  }

  function handleEmailInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (input.checkValidity()) {
      clearDeleteError('email');
      $message = undefined;
    }
  }
</script>

<svelte:head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<div
  class="udm-theme udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1 border-s-4 border-base-content ps-3 pe-2">
          <h1 class="text-2xl font-bold tracking-tight leading-none break-words">
            {m.manage_data_title()}
          </h1>
          <p class="mt-1 text-xs leading-tight text-base-content/75 break-words">
            {m.manage_data_description()}
          </p>
        </div>
        <div class="max-w-full shrink-0 rounded-xl bg-neutral p-1 shadow-sm">
          <LocaleSelector
            current={currentLocale}
            l10nMap={data.l10nMap}
            locales={data.app.languages as Locale[]}
            fallbacks={data.fallbacks}
          />
        </div>
      </div>
    </div>

    <div class="px-5 pb-4 mt-2 flex items-start gap-4">
      <div class="avatar">
        <div class="w-14 rounded-2xl shadow-sm bg-primary/5 p-0.5">
          <img src={data.app.icon} alt={m.app_icon_alt()} />
        </div>
      </div>
      <div class="min-w-0 grow text-start">
        <h2 class="text-lg font-bold tracking-tight leading-tight break-words">{data.app.name}</h2>
        <p class="mt-1 text-sm text-primary font-bold leading-tight break-words">
          {data.app.developer}
        </p>
      </div>
    </div>

    <div class="px-5">
      <a
        class="btn btn-ghost btn-sm mb-4 w-full border border-base-300"
        href={localizeHref(`/user-data/${data.app.id}/about`, { locale: currentLocale })}
      >
        {m.about_app()}
      </a>
    </div>

    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-5 space-y-4 break-words">
          <div>
            <h2 class="card-title text-lg font-bold">{m.deletion_request_title()}</h2>
            <p class="mt-1 ps-3 text-xs leading-relaxed text-base-content/80">
              {m.deletion_request_description_1()}
            </p>
            <p class="mt-1 ps-3 text-xs leading-relaxed text-base-content/80">
              {m.deletion_request_description_2()}
            </p>
          </div>

          <form method="POST" action="?/sendCode" use:enhance class="space-y-4">
            <input type="hidden" name="turnstileToken" bind:value={$form.turnstileToken} />

            <div class="flex w-full flex-col gap-1">
              <label
                class="text-xs font-bold uppercase tracking-wide text-base-content/70"
                for="email"
              >
                {m.email_label()}
              </label>
              <input
                id="email"
                type="email"
                placeholder={m.email_placeholder()}
                class="input h-11 w-full border border-base-300 text-base focus:border-primary focus:outline-primary sm:text-sm"
                name="email"
                bind:value={$form.email}
                oninput={handleEmailInput}
              />
              <p class="text-[10px] text-base-content/70">{m.email_hint()}</p>
              {#if deleteSubmitAttempted && $errors.email}
                <span class="text-error text-xs leading-tight">{$errors.email[0]}</span>
              {/if}
            </div>

            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-base-content/70">
                {m.deletion_scope_label()}
              </p>
              <div class="flex flex-col gap-3 mt-1">
                {#each deletionTypes as type}
                  <label class="flex cursor-pointer items-start gap-3 group min-w-0">
                    <input
                      type="radio"
                      name="deletionType"
                      class="radio radio-primary radio-sm mt-1 shrink-0"
                      value={type}
                      bind:group={$form.deletionType}
                    />
                    <div class="min-w-0">
                      <span
                        class="font-bold text-sm group-hover:text-primary transition-colors whitespace-normal break-words"
                      >
                        {m[`delete_${type}_label`]()}
                      </span>
                      <p
                        class="mt-0.5 text-xs leading-tight whitespace-normal break-words text-base-content/75"
                      >
                        {m[`delete_${type}_description`]()}
                      </p>
                    </div>
                  </label>
                {/each}
                <p class="mt-0.5 text-xs leading-tight text-base-content/75">
                  {m.deletion_warning()}
                </p>
              </div>
            </div>

            <div class="rounded-lg border border-base-300 bg-base-200 p-4">
              <div class="mb-2 text-[10px] font-bold uppercase tracking-wide text-base-content/70">
                {m.items_to_be_removed_title()}
              </div>
              <ul class="list-disc list-inside space-y-1 text-xs text-base-content/80">
                {#each m.items_to_be_removed_list().split('\n').filter(Boolean) as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>

            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-base-content/70">
                {m.verification_label()}
              </p>
              <div class="mt-2">
                <div
                  class="cf-turnstile"
                  data-sitekey={env.PUBLIC_TURNSTILE_SITEKEY}
                  data-callback="handleTurnstileSuccess"
                ></div>
              </div>
              {#if deleteSubmitAttempted && $errors.turnstileToken}
                <span class="mt-2 text-error text-xs leading-tight">
                  {$errors.turnstileToken[0]}
                </span>
              {/if}
            </div>

            <button
              class="btn btn-primary w-full border border-primary/20 shadow-sm"
              type="submit"
              disabled={$delayed}
            >
              {#if $delayed}
                <span class="loading loading-spinner"></span>
              {:else}
                {m.send_verification_code()}
              {/if}
            </button>

            {#if $message?.error}
              <p class="text-error text-xs leading-tight">{$message.error}</p>
            {/if}
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
