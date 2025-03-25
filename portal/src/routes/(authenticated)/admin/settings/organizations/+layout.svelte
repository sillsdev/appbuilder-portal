<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<h2>{m.admin_settings_organizations_title()}</h2>
{@render children?.()}
