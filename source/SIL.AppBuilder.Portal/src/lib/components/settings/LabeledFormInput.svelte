<!--
    @component
    An input slot for a form (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/i18n';
  import { m } from '$lib/paraglide/messages';
  interface Props {
    name: ValidI13nKey;
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { name, className = '', children }: Props = $props();
</script>

<div class={className}>
  <label class="flex flex-col w-full">
    <div class="label">
      <span class="fieldset-label">
        {m[name]()}
      </span>
    </div>
    {@render children?.()}
  </label>
</div>
