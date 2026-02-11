<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header: string | Snippet;
    children?: Snippet;
  }

  let { header, children }: Props = $props();
</script>

<div class="border border-black/20 dark:border-gray-50/20 rounded-lg p-2">
  <div>
    <span>
      {#if typeof header === 'string'}
        {header}
      {:else}
        {@render header()}
      {/if}
    </span>
  </div>
  {@render children?.()}
</div>
