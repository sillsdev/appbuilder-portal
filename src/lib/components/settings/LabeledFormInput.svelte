<!--
    @component
    An input slot for a form (stylized)
-->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
  import IconContainer from '../IconContainer.svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props extends ValueKey {
    children?: Snippet;
    input?: HTMLInputAttributes & {
      class?: ClassValue;
      err?: string;
      icon?: string;
    };
    value?: T;
  }

  let { key, params = {}, class: classes, children, input, value = $bindable() }: Props = $props();
</script>

<label class={['flex flex-col w-full', classes]}>
  <div class="label">
    <span class="fieldset-label">
      <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
      {m[key](params as any)}
    </span>
  </div>
  {#if input}
    <div class={['input input-bordered w-full validator']}>
      {#if input.icon}
        <IconContainer icon={input.icon} width={20} class="cursor-pointer opacity-80" />
      {/if}
      <input type="text" {...input} bind:value />
    </div>
    <span class="validator-hint">
      {#if input.err}{input.err}{:else}&nbsp;{/if}
    </span>
  {:else}
    {@render children?.()}
  {/if}
</label>
