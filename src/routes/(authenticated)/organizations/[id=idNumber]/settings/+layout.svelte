<script lang="ts">
  import { type Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();
</script>

<TabbedMenu
  baseRouteId={'/(authenticated)/organizations/[id=idNumber]/settings'}
  routeParams={{ id: page.params.id! }}
  menuItems={[
    {
      text: m.org_navBasic(),
      route: 'info',
      icon: Icons.Info
    },
    {
      text: m.org_navProducts(),
      route: 'products',
      icon: Icons.Product
    },
    {
      text: m.org_navStores(),
      route: 'stores',
      icon: Icons.StoreMenu
    },
    {
      text: m.org_navGroups(),
      route: 'groups',
      icon: Icons.Group
    },
    {
      text: m.org_navInfrastructure(),
      route: 'infrastructure',
      icon: Icons.BuildEngine
    }
  ]}
  titleString={m.org_settingsTitle() + ': ' + data.organization.Name}
>
  {@render children?.()}
</TabbedMenu>
