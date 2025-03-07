<script>
  import * as m from '$lib/paraglide/messages';
  /** @type {{children?: import('svelte').Snippet}} */
  let { children } = $props();
</script>

<h2>{m.admin_settings_buildEngines_title()}</h2>
{@render children?.()}
