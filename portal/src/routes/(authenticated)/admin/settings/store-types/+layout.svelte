<script>
  import { m } from '$lib/paraglide/messages';
  /** @type {{children?: import('svelte').Snippet}} */
  let { children } = $props();
</script>

<h2>{m.admin_settings_storeTypes_title()}</h2>
{@render children?.()}
