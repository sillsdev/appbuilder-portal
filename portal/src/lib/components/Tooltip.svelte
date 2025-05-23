<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    tip?: string | null | undefined;
    className?: string;
    // tooltip-content can also be handled in the children snippet
    children?: Snippet;
  }

  let { tip, className = '', children }: Props = $props();
</script>

<span
  class="tooltip [--tt-bg:var(--color-white)] dark:tooltip-secondary {className}"
  data-tip={tip}
>
  {@render children?.()}
</span>

<style>
  .tooltip::before, .tooltip :global(.tooltip-content) {
    box-shadow: var(--shadow-md);
  }
</style>
