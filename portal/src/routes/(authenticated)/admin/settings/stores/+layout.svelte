<script lang="ts">
  import type { Snippet } from 'svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<h2>{m.admin_nav_stores()}</h2>
{@render children?.()}
