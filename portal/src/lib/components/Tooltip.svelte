<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    tip: string | null | undefined;
    className?: string; // TODO: Add snippet support once we have DaisyUI 5
    children?: Snippet;
  }

  let { tip, className = '', children }: Props = $props();
  
</script>

<span class="tooltip [--tt-bg:#FFFFFF] dark:tooltip-secondary {className}" data-tip={tip}>
  {@render children?.()}
</span>

<style>
  .tooltip::before {
    box-shadow: var(--shadow-md);
  }
</style>
