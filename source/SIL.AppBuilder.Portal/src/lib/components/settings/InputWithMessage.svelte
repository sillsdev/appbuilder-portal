<!--
    @component
    An input slot with an inline message (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/i18n';
  import * as m from '$lib/paraglide/messages';
  interface Props {
    name: ValidI13nKey;
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { name, className = '', children }: Props = $props();
</script>

<div class="flex flex-row items-center gap-2 {className}">
  <div class="fieldset-label items-start grow">
    <span class="text-sm">
      {m[name]()}
    </span>
  </div>
  {@render children?.()}
</div>
