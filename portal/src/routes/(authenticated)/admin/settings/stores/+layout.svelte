<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<h2>{m.admin_settings_navigation_stores()}</h2>
{@render children?.()}
