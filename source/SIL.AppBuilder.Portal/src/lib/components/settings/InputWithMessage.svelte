<!--
    @component
    An input slot with an inline message (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';

  interface Props {
    name: ValidI13nKey;
    messageParms?: any;
    className?: string;
    children?: Snippet;
  }

  let { name, messageParms, className = '', children }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2 {className}">
  <div class="fieldset-label items-start grow">
    <span class="text-sm">
      {m[name](messageParms)}
    </span>
  </div>
  {@render children?.()}
</div>
