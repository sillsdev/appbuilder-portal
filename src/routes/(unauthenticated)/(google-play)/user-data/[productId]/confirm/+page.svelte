<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { m } from '$lib/google-play/paraglide/messages';
  import { DEFAULT_ICON, getThemeVariables } from '$lib/utils/theme';

  type ConfirmStep = 'email' | 'code' | 'verified';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  const confirmEmailStorageKey = `udm-confirm-email:${app.id}`;
  let themeColor = $state(app.themeColor ?? '#0e795b');
  let themeVars = $derived(getThemeVariables(themeColor));
  let themeStyle = $derived(
    `--color-primary: ${themeVars.primaryHex}; --color-primary-content: ${themeVars.primaryContentHex}; --outer-bg: ${themeVars.lightBgHex}; --udm-outer-light: ${themeVars.lightBgHex}; --udm-outer-dark: ${themeVars.darkBgHex};`
  );

  const {
    form: sendForm,
    enhance: sendEnhance,
    message: sendMessage,
    delayed: sendDelayed,
    errors: sendErrors
  } = superForm(data.sendCodeForm, {
    onUpdated: ({ form }) => {
      if (form.valid && form.message?.step === 'verify') {
        step = 'code';
        $sendForm.email = form.message.email;
        $verifyForm.email = form.message.email;
        sessionStorage.setItem(confirmEmailStorageKey, form.message.email);
      } else if (!form.valid && !form.message?.error) {
        $sendMessage = { error: m.udm_alert_verification_failed() };
      }
    }
  });

  const {
    form: verifyForm,
    enhance: verifyEnhance,
    message: verifyMessage,
    delayed: verifyDelayed,
    errors: verifyErrors
  } = superForm(data.verifyCodeForm, {
    onUpdated: ({ form }) => {
      if (form.valid && form.message?.verified) {
        step = 'verified';
        sessionStorage.removeItem(confirmEmailStorageKey);
      } else if (!form.valid && !form.message?.error) {
        $verifyMessage = { error: m.udm_error_invalid_code_retry() };
      }
    }
  });

  let step = $state<ConfirmStep>(
    data.verifyCodeForm?.message?.verified
      ? 'verified'
      : data.sendCodeForm?.message?.step === 'verify' || data.email
        ? 'code'
        : 'email'
  );

  onMount(() => {
    const storedEmail = sessionStorage.getItem(confirmEmailStorageKey)?.trim().toLowerCase();
    if (storedEmail && step === 'email') {
      $sendForm.email = storedEmail;
      $verifyForm.email = storedEmail;
      step = 'code';
    }
  });
</script>

<div
  class="udm-confirm-root min-h-screen flex items-center justify-center bg-base-200 font-sans p-4"
  style={`${themeStyle}; background-color: var(--udm-outer-light);`}
>
  <div class="card bg-base-100 w-full max-w-[400px] shadow-xl overflow-hidden rounded-lg">
    <div class="bg-primary p-10 px-8 text-center text-primary-content">
      <div class="flex justify-center gap-4 mb-4">
        {#if step !== 'verified'}
          <div class="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">
            <img
              src={iconSrc}
              alt={m.app_icon_alt()}
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
          {m.udm_verified_title()}
        {:else if step === 'code'}
          {m.udm_check_email_title()}
        {:else}
          {m.udm_enter_email_title()}
        {/if}
      </h1>
    </div>

    <div class="p-8">
      {#if step === 'email'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.udm_enter_email_description()}
        </p>

        <form method="POST" action="?/sendCode" use:sendEnhance>
          <input type="hidden" name="productId" bind:value={$sendForm.productId} />
          <div class="mb-6 flex flex-col gap-2">
            <label for="email" class="sr-only">{m.udm_email_placeholder_name()}</label>
            <input
              id="email"
              type="email"
              name="email"
              bind:value={$sendForm.email}
              placeholder={m.udm_email_placeholder_name()}
              required
              class="input input-bordered w-full h-14 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if $sendErrors.email}
              <span class="text-error text-sm text-center mt-1">{$sendErrors.email[0]}</span>
            {/if}
            {#if $sendMessage?.error}
              <span class="text-error text-sm text-center mt-1">{$sendMessage.error}</span>
            {/if}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full text-white no-animation h-14"
            disabled={$sendDelayed}
          >
            {#if $sendDelayed}
              <span class="loading loading-spinner"></span>
            {:else}
              {m.udm_send_code()}
            {/if}
          </button>
        </form>
      {:else if step === 'code'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.udm_check_email_description({ email: $verifyForm.email })}
        </p>

        <form method="POST" action="?/verifyCode" use:verifyEnhance>
          <input type="hidden" name="email" bind:value={$verifyForm.email} />
          <input type="hidden" name="productId" bind:value={$verifyForm.productId} />
          <div class="mb-6 flex flex-col gap-2">
            <label for="code" class="sr-only">000000</label>
            <input
              id="code"
              type="text"
              name="code"
              bind:value={$verifyForm.code}
              placeholder="000000"
              maxlength="6"
              autocomplete="one-time-code"
              required
              class="input input-bordered w-full h-16 text-[2rem] text-center tracking-[0.5rem] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if $verifyErrors.code}
              <span class="text-error text-sm text-center mt-1">{$verifyErrors.code[0]}</span>
            {/if}
            {#if $verifyMessage?.error}
              <span class="text-error text-sm text-center mt-1">{$verifyMessage.error}</span>
            {/if}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full text-white no-animation h-14"
            disabled={$verifyDelayed}
          >
            {#if $verifyDelayed}
              <span class="loading loading-spinner"></span>
            {:else}
              {m.udm_verify_code()}
            {/if}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-base-content/60">
          <p>
            {m.udm_did_not_receive_code()}
            <button
              type="button"
              onclick={() => {
                sessionStorage.removeItem(confirmEmailStorageKey);
                step = 'email';
              }}
              class="link link-primary font-bold no-underline hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {m.udm_change_email()}
            </button>
          </p>
        </div>
      {:else if step === 'verified'}
        <div class="text-center flex flex-col gap-4">
          <p class="text-lg font-bold text-base-content">{m.udm_verification_complete_title()}</p>
          <p class="text-base-content/70 text-[0.95rem]">
            {m.udm_verification_complete_description()}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global([data-theme='dark']) .udm-confirm-root {
    background-color: var(--udm-outer-dark) !important;
  }
</style>
