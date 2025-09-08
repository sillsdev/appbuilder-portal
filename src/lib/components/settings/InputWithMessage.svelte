<!--
    @component
    An input slot with an inline message (stylized)
    
-->
<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import type { Snippet } from 'svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    title?: ValueKey;
    message?: ValueKey;
    className?: string;
    children?: Snippet;
  }

  let { title, message, className = '', children }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2 {className}">
  <div class="fieldset-label flex-col items-start grow text-base-content">
    {#if title}
      <span class={title.classes ?? ''}>
        {m[title.key](title.params as any)}
      </span>
    {/if}
    {#if message}
      <span class="text-sm {message.classes ?? ''}">
        {m[message.key](message.params as any)}
      </span>
    {/if}
  </div>
  {@render children?.()}
</div>

<style>
  .fieldset-label > :not(.text-sm) {
    font-weight: bold;
  }
</style>
