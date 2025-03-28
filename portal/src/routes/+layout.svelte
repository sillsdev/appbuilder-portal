<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';
  
  interface Props {
    children?: Snippet;
  }
  
  let { children }: Props = $props();
</script>

<div class="h-screen w-full flex flex-col">
  {@render children?.()}
</div>
