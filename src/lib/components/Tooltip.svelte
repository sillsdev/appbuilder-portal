<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    tip?: string | null | undefined;
    class?: ClassValue;
    // tooltip-content can also be handled in the children snippet
    children?: Snippet;
  }

  let { tip, class: classes, children }: Props = $props();
</script>

<span
  class={['tooltip [--tt-bg:var(--color-white)] dark:tooltip-secondary', classes]}
  data-tip={tip}
>
  {@render children?.()}
</span>

<style>
  .tooltip::before,
  .tooltip :global(.tooltip-content) {
    box-shadow: var(--shadow-md);
  }
</style>
