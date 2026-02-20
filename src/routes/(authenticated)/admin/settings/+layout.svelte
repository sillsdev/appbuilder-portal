<!--
    @component
    A settings menu
    
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let adminLinks = [
    { text: m.admin_nav_orgs(), route: 'organizations', icon: Icons.Organization },
    {
      text: m.admin_nav_flowDefs(),
      route: 'workflow-definitions',
      icon: Icons.Workflow
    },
    { text: m.admin_nav_prodDefs(), route: 'product-definitions', icon: Icons.Product },
    { text: m.admin_nav_stores(), route: 'stores', icon: Icons.StoreMenu },
    { text: m.admin_nav_storeTypes(), route: 'store-types', icon: Icons.StoreTypeMenu },
    { text: m.admin_nav_buildEngines(), route: 'build-engines', icon: Icons.BuildEngine }
  ];
</script>

<TabbedMenu
  baseRouteId="/(authenticated)/admin/settings"
  titleString={m.admin_title()}
  menuItems={adminLinks}
>
  {@render children?.()}
</TabbedMenu>
