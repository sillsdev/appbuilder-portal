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

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();
</script>

<TabbedMenu
  base="{base}/organizations/{$page.params.id}/settings"
  routeId="/(authenticated)/organizations/[id]/settings"
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
  {#snippet title()}
    <div class="w-full">
      <h1 class="p-4 pl-3 pb-0 [text-wrap:nowrap]">
        {org_settingsTitle()}
      </h1>
      <h2>{data.organization.Name}</h2>
    </div>
  {/snippet}
  {@render children?.()}
</TabbedMenu>
