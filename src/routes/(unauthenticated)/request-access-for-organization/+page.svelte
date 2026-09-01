<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import { env } from '$env/dynamic/public';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m as gp } from '$lib/google-play/paraglide/messages';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { initTurnstile, resolveToken } from '$lib/turnstile';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let submitAttempted = $state(false);

  let websiteVerified: 'empty' | 'pending' | 'verified' | 'unreachable' = $state('empty');

  const { form, enhance, delayed } = superForm(data.form, {
    invalidateAll: false,
    resetForm: false,
    onSubmit: ({ cancel, formData }) => {
      submitAttempted = true;

      $form.turnstileToken ||= resolveToken(formData) || '';

      if (!$form.turnstileToken) {
        cancel();
        return;
      }

      formData.set('turnstileToken', $form.turnstileToken);
    },
    onUpdate: ({ result }) => {
      const resultData = result.data as ActionData;
      if (!resultData?.ok || !resultData?.form.data.turnstileToken) {
        window.turnstile?.reset?.();
        $form.turnstileToken = '';

        toast('error', m.errors_generic({ errorMessage: '' }));
      }
    }
  });

  onMount(() =>
    initTurnstile(
      '#turnstile-container',
      env.PUBLIC_ORG_REQUEST_TURNSTILE_SITEKEY,
      (token: string) => {
        $form.turnstileToken = token;
      }
    )
  );
</script>

<svelte:head>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    async
    defer
  ></script>
</svelte:head>

<form action="?/request" method="post" use:enhance class="text-left">
  <div>
    <h1 class="text-center">{m.invitations_requestOrgInvite()}</h1>
    {#if data.publicOrgExists}
      <p class="text-left p-4 pt-0">
        {m.invitations_verifyUser()}
        <a class="link" href={localizeHref('/our-users')} target="_blank">
          {m.invitations_ourUsers()}
          <IconContainer icon={Icons.Open} width={18} />
        </a>
      </p>
    {/if}
    <LabeledFormInput
      key="invitations_orgName"
      input={{
        name: 'organizationName',
        required: true,
        icon: Icons.Edit,
        err: m.formErrors_nameEmpty()
      }}
      bind:value={$form.organizationName}
    />
    <LabeledFormInput
      key="invitations_orgAdminEmail"
      input={{
        name: 'email',
        type: 'email',
        required: true,
        icon: Icons.Email,
        err: $form.email ? m.formErrors_emailEmpty() : m.formErrors_emailInvalid()
      }}
      bind:value={$form.email}
    />
    <LabeledFormInput key="invitations_orgUrl">
      <span class="input w-full flex flex-row gap-2 items-center validator">
        <IconContainer icon={Icons.URL} width={20} />
        <input
          name="url"
          type="url"
          class="grow"
          required
          bind:value={$form.url}
          oninput={(e) => {
            websiteVerified = 'empty';
            e.currentTarget.setCustomValidity('');
          }}
          onchange={(e) => {
            const input = e.currentTarget;
            let url = '';
            try {
              url = new URL($form.url).toString();
            } catch {
              // empty
              websiteVerified = 'empty';
            }

            if (url) {
              websiteVerified = 'pending';
              fetch(url, { mode: 'no-cors' })
                .then(() => {
                  websiteVerified = 'verified';
                  input.setCustomValidity('');
                })
                .catch(() => {
                  websiteVerified = 'unreachable';
                  input.setCustomValidity(m.invitations_verifyWebsite());
                });
            }
          }}
        />
        {#if websiteVerified === 'pending'}
          <span class="loading-spinner"></span>
        {:else if websiteVerified === 'verified'}
          <IconContainer icon={Icons.Checkmark} width={24} class="text-success" />
        {:else if websiteVerified === 'unreachable'}
          <IconContainer icon={Icons.Close} width={24} class="text-error" />
        {/if}
      </span>
      <span class="validator-hint">
        {$form.url
          ? m.invitations_verifyWebsite()
          : m.errors_requiredField({ field: m.invitations_orgUrl() })}
      </span>
    </LabeledFormInput>
  </div>
  <div class="mt-2 text-center">
    <div id="turnstile-container"></div>
  </div>
  {#if submitAttempted && !$form.turnstileToken}
    <span class="mt-2 text-error text-xs leading-tight">
      {gp.alert_verify_human({}, { locale: getLocale() })}
    </span>
  {/if}
  <div class="mt-4">
    <SubmitButton
      class="float-right"
      key="common_passThrough"
      params={{ value: gp.send_verification_code({}, { locale: getLocale() }) }}
      icon={Icons.Send}
      disabled={!$form.organizationName || !$form.email || websiteVerified !== 'verified'}
      waiting={$delayed}
    />
  </div>
</form>
