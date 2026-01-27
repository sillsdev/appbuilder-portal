<!--
    @component
    An input slot with an inline message (stylized)
    
-->
<script lang="ts">
  /* eslint-disable @typescript-eslint/no-explicit-any */
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { ValueKey } from '$lib/locales.svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    title?: ValueKey;
    message?: ValueKey;
    class?: ClassValue;
    children?: Snippet;
  }

  let { title, message, class: classes, children }: Props = $props();
</script>

<label class={['flex flex-row items-center gap-2', classes]}>
  <div class="fieldset-label flex-col items-start grow text-base-content">
    {#if title}
      <span class={['title', title.class]}>
        {m[title.key](title.params as any)}
      </span>
    {/if}
    {#if message}
      <span class={['text-sm', message.class]}>
        {m[message.key](message.params as any)}
      </span>
    {/if}
  </div>
  {@render children?.()}
</label>

<style>
  .title {
    font-weight: bold;
  }
</style>
