<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { confirmationStorageKey } from '$lib/google-play';
  import { m } from '$lib/google-play/paraglide/messages';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  type ConfirmStep = 'code' | 'verified';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const confirmEmailStorageKey = confirmationStorageKey(data.app.id);

  const { form, enhance, message, delayed, errors } = superForm(data.form, {
    onUpdated: ({ form }) => {
      if (form.valid && form.message?.verified) {
        step = 'verified';
        sessionStorage.removeItem(confirmEmailStorageKey);
      } else if (!form.valid && !form.message?.error) {
        $message = { error: m.error_invalid_code_retry() };
      }
    }
  });

  let step = $state<ConfirmStep>(data.form?.message?.verified ? 'verified' : 'code');

  onMount(() => {
    const storedEmail = sessionStorage.getItem(confirmEmailStorageKey)?.trim().toLowerCase();
    if (storedEmail) {
      $form.email = storedEmail;
    }
  });
</script>

<div
  class="udm-theme udm-confirm-root min-h-screen flex items-center justify-center bg-base-200 font-sans p-4"
>
  <div class="card bg-base-100 w-full max-w-[400px] shadow-xl overflow-hidden rounded-lg">
    <div class="bg-primary p-4 px-8 text-center text-primary-content">
      <div class="card-actions justify-start">
        <button
          class="btn btn-square btn-sm btn-ghost text-primary-content"
          onclick={() => history.back()}
        >
          <IconContainer icon={Icons.Back} width={24} />
        </button>
      </div>
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
        {/if}
      </h1>
    </div>

    <div class="p-8">
      {#if step === 'code'}
        <p class="text-base-content/70 text-center leading-relaxed mb-8">
          {m.check_email_description({ email: $form.email })}
        </p>

        <form method="POST" action="?/verifyCode" use:enhance>
          <input type="hidden" name="email" bind:value={$form.email} />
          <div class="mb-6 flex flex-col gap-2">
            <label for="code" class="sr-only">000000</label>
            <input
              id="code"
              type="text"
              name="code"
              bind:value={$form.code}
              placeholder="000000"
              maxlength="6"
              autocomplete="one-time-code"
              required
              class="input h-16 w-full border border-base-300 text-center text-[2rem] tracking-[0.5rem] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {#if $errors.code}
              <span class="text-error text-sm text-center mt-1">{$errors.code[0]}</span>
            {/if}
            {#if $message?.error}
              <span class="text-error text-sm text-center mt-1">{$message.error}</span>
            {/if}
          </div>

          <button type="submit" class="btn btn-primary h-14 w-full" disabled={$delayed}>
            {#if $delayed}
              <span class="loading loading-spinner"></span>
            {:else}
              {m.verify_code()}
            {/if}
          </button>
        </form>
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

<style>
  .card-actions {
    margin-left: calc(var(--spacing) * -4);
  }

  .btn-ghost.text-primary-content:hover {
    color: var(--color-base-content);
  }
</style>
