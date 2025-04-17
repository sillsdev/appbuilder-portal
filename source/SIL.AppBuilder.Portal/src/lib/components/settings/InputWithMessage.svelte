<!--
    @component
    An input slot with an inline message (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';

  interface Props {
    title?: {
      key: ValidI13nKey;
      parms?: any;
      classes?: string;
    };
    message?: {
      key: ValidI13nKey;
      parms?: any;
      classes?: string;
    };
    className?: string;
    children?: Snippet;
  }

  let { title, message, className = '', children }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2 {className}">
  <div class="fieldset-label flex-col items-start grow">
    {#if title}
      <span class={title.classes ?? ''}>
        {m[title.key](title.parms)}
      </span>
    {/if}
    {#if message}
      <span class="text-sm {message.classes ?? ''}">
        {m[message.key](message.parms)}
      </span>
    {/if}
  </div>
  {@render children?.()}
</div>
