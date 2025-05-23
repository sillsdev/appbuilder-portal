<!--
    @component
    An input slot for a form (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';
  
  interface Props {
    name: ValidI13nKey;
    messageParms?: any;
    className?: string;
    children?: Snippet;
  }

  let { name, messageParms, className = '', children }: Props = $props();
</script>

<label class="flex flex-col w-full {className}">
  <div class="label">
    <span class="fieldset-label">
      {m[name](messageParms)}
    </span>
  </div>
  {@render children?.()}
</label>
