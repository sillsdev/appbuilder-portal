<!--
    @component
    A settings menu
    
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let adminLinks = [
    { text: m.admin_nav_orgs(), route: 'organizations' },
    { text: m.admin_nav_flowDefs(), route: 'workflow-definitions' },
    { text: m.admin_nav_prodDefs(), route: 'product-definitions' },
    { text: m.admin_nav_software_update(), route: 'software-update'},
    { text: m.admin_nav_stores(), route: 'stores' },
    { text: m.admin_nav_storeTypes(), route: 'store-types' },
    { text: m.admin_nav_buildEngines(), route: 'build-engines' }
  ];
</script>

<TabbedMenu
  baseRouteId="/(authenticated)/admin/settings"
  titleString={m.admin_title()}
  menuItems={adminLinks}
>
  {@render children?.()}
</TabbedMenu>
