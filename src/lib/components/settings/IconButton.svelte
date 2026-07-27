<script lang="ts" module>
  export interface IconButtonProps extends Partial<ValueKey> {
    type?: HTMLButtonElement['type'];
    icon?: IconType;
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '../../icons/IconContainer.svelte';
  import { type IconType, Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import type { ValueKey } from '$lib/utils';

  let {
    type = 'button',
    class: classes,
    icon = Icons.Save,
    disabled = false,
    key = 'common_save',
    params,
    onclick,
    children
  }: IconButtonProps = $props();
</script>

<button {type} class={['btn', classes]} {disabled} {onclick}>
  {#if children}
    {@render children()}
  {:else}
    <IconContainer {icon} width={20} />
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[key](params as any)}
  {/if}
</button>
