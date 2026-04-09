<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div data-theme="light" class="flex flex-col w-full h-full overflow-auto">
  {@render children?.()}
</div>
