<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<div
  class="grid w-full h-full place-items-center place-content-center [background-color:#0068a6] text-black"
>
  <div>
    <div class="card shadow-xl bg-white border p-4 max-w-xl text-center">
      {@render children()}
    </div>
  </div>
</div>
