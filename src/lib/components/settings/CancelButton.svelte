<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '../../icons/IconContainer.svelte';
  import { type IconType, Icons } from '$lib/icons';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props extends Partial<ValueKey> {
    icon?: IconType;
    onclick?: () => void;
    children?: Snippet;
    returnTo?: string;
    resetForm?: boolean;
  }

  let {
    class: classes,
    icon = Icons.Cancel,
    key = 'common_cancel',
    params,
    onclick,
    children,
    returnTo: href,
    resetForm = false
  }: Props = $props();
</script>

<button type={resetForm ? 'reset' : 'button'} class={['btn btn-secondary', classes]} {onclick}>
  {#if children}
    {@render children()}
  {:else if href}
    <a {href}>
      <IconContainer {icon} width={20} />
      <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
      {m[key](params as any)}
    </a>
  {:else}
    <IconContainer {icon} width={20} />
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[key](params as any)}
  {/if}
</button>
