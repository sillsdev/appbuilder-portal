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
  import { getLocale } from '$lib/paraglide/runtime';
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
      if (
        resultData &&
        !resultData.ok &&
        'websiteVerified' in resultData &&
        !resultData.websiteVerified
      ) {
        toast('error', m.invitations_verifyWebsite());
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
    <LabeledFormInput
      key="invitations_orgUrl"
      input={{
        name: 'url',
        type: 'url',
        icon: Icons.URL,
        required: true,
        err: m.errors_requiredField({ field: m.invitations_orgUrl() })
      }}
      bind:value={$form.url}
    />
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
