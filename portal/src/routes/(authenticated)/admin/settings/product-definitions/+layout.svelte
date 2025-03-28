<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<h2>{m.admin_settings_productDefinitions_title()}</h2>
{@render children?.()}
