<script lang="ts">
  import type { Snippet } from 'svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<h2>{m.buildEngines_title()}</h2>
{@render children?.()}
