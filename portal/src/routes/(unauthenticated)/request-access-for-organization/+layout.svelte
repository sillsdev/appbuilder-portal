<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="card shadow-xl bg-white border p-4 max-w-xl text-center">
  {@render children()}
</div>
