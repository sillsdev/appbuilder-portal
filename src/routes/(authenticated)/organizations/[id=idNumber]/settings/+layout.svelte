<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeUrl } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();
</script>

<TabbedMenu
  base="{base}/organizations/{page.params.id}/settings"
  routeId="/(authenticated)/organizations/[id]/settings"
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
      {#if data.organizations.length > 1}
        <h2>
          <OrganizationDropdown
            bind:value={$orgActive}
            organizations={data.organizations}
            selectProperties={{
              onChange: () =>
                goto(
                  localizeUrl(
                    page.url.pathname.replace(
                      `/organizations/${page.params.id}`,
                      `/organizations/${$orgActive}`
                    )
                  )
                )
            }}
          />
        </h2>
      {:else}
        <h2>{data.organization.Name}</h2>
      {/if}
    </div>
  {/snippet}
  {@render children?.()}
</TabbedMenu>
