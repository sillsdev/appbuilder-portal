<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '../IconContainer.svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props extends Partial<ValueKey> {
    icon?: string;
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
  }

  let {
    class: classes,
    icon = 'material-symbols:save-outline',
    disabled = false,
    key = 'common_save',
    params,
    onclick,
    children
  }: Props = $props();
</script>

<button type="submit" class={['btn btn-primary', classes]} {disabled} {onclick}>
  {#if children}
    {@render children()}
  {:else}
    <IconContainer {icon} width={20} />
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[key](params as any)}
  {/if}
</button>
