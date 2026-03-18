<script lang="ts">
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<div
  class="grid grid-cols-1 w-full min-h-screen place-self-start place-items-stretch place-content-start text-base-content sm:place-items-center sm:place-content-center"
>
  {@render children()}
</div>
