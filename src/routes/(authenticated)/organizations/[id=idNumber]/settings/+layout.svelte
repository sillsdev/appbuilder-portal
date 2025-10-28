<script lang="ts">
  import { type Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
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
      route: 'info'
    },
    {
      text: m.org_navProducts(),
      route: 'products'
    },
    {
      text: m.org_navStores(),
      route: 'stores'
    },
    {
      text: m.org_navGroups(),
      route: 'groups'
    },
    {
      text: m.org_navInfrastructure(),
      route: 'infrastructure'
    }
  ]}
>
  {#snippet title()}
    <div class="w-full">
      <h1 class="p-4 pl-3 pb-0 [text-wrap:nowrap]">
        {m.org_settingsTitle()}
      </h1>
      <h2>{data.organization.Name}</h2>
    </div>
  {/snippet}
  {@render children?.()}
</TabbedMenu>
