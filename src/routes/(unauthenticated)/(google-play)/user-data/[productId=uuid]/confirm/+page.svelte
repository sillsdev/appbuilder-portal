<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { confirmationStorageKey } from '$lib/google-play';
  import { m } from '$lib/google-play/paraglide/messages';
  import { getThemeStyle } from '$lib/utils/theme';

  type ConfirmStep = 'email' | 'code' | 'verified';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const confirmEmailStorageKey = confirmationStorageKey(data.app.id);

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
        $sendMessage = { error: m.alert_verification_failed() };
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
        $verifyMessage = { error: m.error_invalid_code_retry() };
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
  class="udm-theme udm-confirm-root min-h-screen flex items-center justify-center bg-base-200 font-sans p-4"
  style={getThemeStyle(data.app.themeColor)}
>
  <div class="card bg-base-100 w-full max-w-[400px] shadow-xl overflow-hidden rounded-lg">
    <div class="bg-primary p-10 px-8 text-center text-primary-content">
      <div class="flex justify-center gap-4 mb-4">
        {#if step !== 'verified'}
          <div class="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center">
            <img
              src={data.app.icon}
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
          {m.verified_title()}
        {:else if step === 'code'}
          {m.check_email_title()}
        {:else}
          {m.enter_email_title()}
        {/if}
      </h1>
    </div>

    <div class="p-8">
      {#if step === 'email'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.enter_email_description()}
        </p>

        <form method="POST" action="?/sendCode" use:sendEnhance>
          <div class="mb-6 flex flex-col gap-2">
            <label for="email" class="sr-only">{m.email_placeholder_name()}</label>
            <input
              id="email"
              type="email"
              name="email"
              bind:value={$sendForm.email}
              placeholder={m.email_placeholder_name()}
              required
              class="input h-14 w-full border border-base-300 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if $sendErrors.email}
              <span class="text-error text-sm text-center mt-1">{$sendErrors.email[0]}</span>
            {/if}
            {#if $sendMessage?.error}
              <span class="text-error text-sm text-center mt-1">{$sendMessage.error}</span>
            {/if}
          </div>

          <button type="submit" class="btn btn-primary h-14 w-full" disabled={$sendDelayed}>
            {#if $sendDelayed}
              <span class="loading loading-spinner"></span>
            {:else}
              {m.send_code()}
            {/if}
          </button>
        </form>
      {:else if step === 'code'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.check_email_description({ email: $verifyForm.email })}
        </p>

        <form method="POST" action="?/verifyCode" use:verifyEnhance>
          <input type="hidden" name="email" bind:value={$verifyForm.email} />
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
              class="input h-16 w-full border border-base-300 text-center text-[2rem] tracking-[0.5rem] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if $verifyErrors.code}
              <span class="text-error text-sm text-center mt-1">{$verifyErrors.code[0]}</span>
            {/if}
            {#if $verifyMessage?.error}
              <span class="text-error text-sm text-center mt-1">{$verifyMessage.error}</span>
            {/if}
          </div>

          <button type="submit" class="btn btn-primary h-14 w-full" disabled={$verifyDelayed}>
            {#if $verifyDelayed}
              <span class="loading loading-spinner"></span>
            {:else}
              {m.verify_code()}
            {/if}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-base-content/60">
          <p>
            {m.did_not_receive_code()}
            <button
              type="button"
              onclick={() => {
                sessionStorage.removeItem(confirmEmailStorageKey);
                step = 'email';
              }}
              class="link link-primary font-bold no-underline hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {m.change_email()}
            </button>
          </p>
        </div>
      {:else if step === 'verified'}
        <div class="text-center flex flex-col gap-4">
          <p class="text-lg font-bold text-base-content">{m.verification_complete_title()}</p>
          <p class="text-base-content/70 text-[0.95rem]">
            {m.verification_complete_description()}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
