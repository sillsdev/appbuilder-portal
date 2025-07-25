<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  data-theme="light"
  class="grid w-full h-full place-items-center place-content-center [background-color:#0068a6]"
>
  {@render children?.()}
</div>
