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
    { text: m.admin_nav_orgs(), route: 'organizations', icon: 'clarity:organization-solid' },
    {
      text: m.admin_nav_flowDefs(),
      route: 'workflow-definitions',
      icon: 'hugeicons:workflow-square-03'
    },
    { text: m.admin_nav_prodDefs(), route: 'product-definitions', icon: 'system-uicons:box' },
    { text: m.admin_nav_stores(), route: 'stores', icon: 'hugeicons:store-04' },
    { text: m.admin_nav_storeTypes(), route: 'store-types', icon: 'hugeicons:store-management-01' },
    { text: m.admin_nav_buildEngines(), route: 'build-engines', icon: 'carbon:build-image' }
  ];
</script>

<TabbedMenu
  baseRouteId="/(authenticated)/admin/settings"
  titleString={m.admin_title()}
  menuItems={adminLinks}
>
  {@render children?.()}
</TabbedMenu>
