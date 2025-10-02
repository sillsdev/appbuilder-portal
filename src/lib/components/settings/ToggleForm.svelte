<!--
    @component
    An abstraction over Toggle which makes it easier to submit simple POSTs using a toggle.
-->
<script lang="ts">
  import { enhance } from '$app/forms';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import type { ValueKey } from '$lib/locales.svelte';
  type Method = 'POST' | 'GET';

  interface Props {
    name: string;
    method: Method;
    action: string;
    formVar: boolean;
    onmsg: string;
    offmsg: string;
    onIcon?: string;
    offIcon?: string;
    title: ValueKey;
    message: ValueKey;
    canEdit?: boolean;
  }

  let {
    name,
    method,
    action,
    formVar,
    onmsg,
    offmsg,
    title,
    message,
    onIcon,
    offIcon,
    canEdit
  }: Props = $props();

  let form: HTMLFormElement;
</script>

<form
  bind:this={form}
  {method}
  {action}
  use:enhance={() =>
    ({ update, result }) => {
      if (result.type === 'success') {
        const res = result.data as { ok: boolean };
        if (res?.ok) {
          if (formVar) {
            toast('success', onmsg);
          } else {
            toast('success', offmsg);
          }
        } else {
          toast('error', m.errors_generic({ errorMessage: '' }));
          formVar = !formVar;
        }
      }
      update({ reset: false });
    }}
>
  <Toggle
    {title}
    {message}
    {name}
    bind:checked={formVar}
    onchange={() => {
      form.requestSubmit();
    }}
    {onIcon}
    {offIcon}
    {canEdit}
  />
</form>
