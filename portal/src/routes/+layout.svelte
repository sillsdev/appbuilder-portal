<script lang="ts">
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import type { Snippet } from 'svelte';
  import '../app.css';
  
  interface Props {
    children?: Snippet;
  }
  
  let { children }: Props = $props();
</script>

<div class="h-screen w-full flex flex-col">
  {@render children?.()}
  <div class="toast toast-top toast-end">
    <SvelteToast />
  </div>
</div>
