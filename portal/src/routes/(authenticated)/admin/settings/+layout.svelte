<!--
    @component
    A settings menu
    
-->
<script lang="ts">
  import { base } from '$app/paths';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { Snippet } from 'svelte';
  
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let adminLinks = [
    { text: m.admin_nav_orgs(), route: 'organizations' },
    { text: m.admin_nav_flowDefs(), route: 'workflow-definitions' },
    { text: m.admin_nav_prodDefs(), route: 'product-definitions' },
    { text: m.admin_nav_stores(), route: 'stores' },
    { text: m.admin_nav_storeTypes(), route: 'store-types' },
    { text: m.admin_nav_buildEngines(), route: 'build-engines' }
  ];
</script>

<TabbedMenu
  routeId="/(authenticated)/admin/settings"
  base="{base}/admin/settings"
  titleString={m.admin_title()}
  menuItems={adminLinks}
>
  {@render children?.()}
</TabbedMenu>
