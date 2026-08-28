<script lang="ts">
  import { derived, readable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m as gp } from '$lib/google-play/paraglide/messages';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const expiresIn = readable(data.ttl, (_set, update) => {
    const interval = setInterval(() => {
      update((val) => {
        if (val) {
          return val - 1;
        } else {
          goto(localizeHref(`request-access-for-organization`), { replaceState: true });
          return val;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const expireTime = derived(expiresIn, ($elapsed) => {
    const date = new Date(0);
    date.setTime($elapsed * 1000);
    const minutes = String(date.getMinutes());
    const seconds = String(date.getSeconds());
    return `${minutes}:${seconds.length > 1 ? '' : '0'}${seconds}`;
  });

  const { form, enhance, delayed } = superForm(data.form, {
    invalidateAll: false,
    resetForm: false,
    onUpdate: ({ result, formElement }) => {
      const resultData = result.data as ActionData;
      if ('codeMatch' in (resultData ?? {})) {
        (formElement.elements.namedItem('code') as HTMLInputElement)?.setCustomValidity(
          gp.error_invalid_code({}, { locale: getLocale() })
        );
      } else if (result.status === 404) {
        goto(localizeHref(`/request-access-for-organization`), { replaceState: true });
      } else if (!resultData?.ok) {
        toast('error', m.errors_generic({ errorMessage: '' }));
      } else {
        goto(localizeHref(`/request-access-for-organization/success`), { replaceState: true });
      }
    }
  });
</script>

<p class="mb-2">
  {gp.check_email_description({ email: data.email }, { locale: getLocale() })}
</p>

<p class="mb-2">{m.common_expires()}: {$expireTime}</p>

<form method="POST" action="?/verifyCode" use:enhance>
  <div class="flex flex-col gap-2">
    <label for="code" class="sr-only">000000</label>
    <input
      id="code"
      type="text"
      name="code"
      bind:value={$form.code}
      placeholder="000000"
      inputmode="numeric"
      pattern="\d+"
      maxlength="6"
      autocomplete="one-time-code"
      required
      class="input h-16 w-36 validator text-center text-[2rem] mx-auto"
    />
    <span class="validator-hint">
      {gp.error_invalid_code({}, { locale: getLocale() })}
    </span>
  </div>

  <SubmitButton
    class="float-right"
    icon={Icons.Send}
    waiting={$delayed}
    key="common_passThrough"
    params={{ value: gp.verify_code({}, { locale: getLocale() }) }}
    disabled={$form.code.length !== 6}
  />
</form>
