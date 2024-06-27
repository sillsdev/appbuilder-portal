<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import {
    org_basicTitle,
    org_groupsTitle,
    org_infrastructureTitle,
    org_productsTitle,
    org_settingsTitle,
    org_storesTitle
  } from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<TabbedMenu
  base="{base}/organizations/{$page.params.id}/settings"
  routeId="/(authenticated)/organizations/[id]/settings"
  title={org_settingsTitle()}
  menuItems={[
    {
      text: org_basicTitle(),
      route: 'info'
    },
    {
      text: org_productsTitle(),
      route: 'products'
    },
    {
      text: org_storesTitle(),
      route: 'stores'
    },
    {
      text: org_groupsTitle(),
      route: 'groups'
    },
    {
      text: org_infrastructureTitle(),
      route: 'infrastructure'
    }
  ]}
>
  <slot />
</TabbedMenu>
