<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';

  let userSettingsLinks = [
    { text: m.users_userProfile(), route: 'profile', icon: 'mdi:info' },
    { text: m.users_userRoles(), route: 'roles', icon: 'oui:app-users-roles' },
    { text: m.users_userGroups(), route: 'groups', icon: 'mdi:account-group' }
  ];

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();
  // route permissions are handled for individual subroutes
</script>

<!-- permissions handled in server -->
{#if data.canEdit}
  <TabbedMenu
    baseRouteId="/(authenticated)/users/[id=idNumber]/settings"
    routeParams={{ id: page.params.id! }}
    titleString={m.users_settingsTitle() + ': ' + data.subject.Name}
    menuItems={userSettingsLinks}
  >
    {@render children?.()}
  </TabbedMenu>
{:else}
  <h1>{m.profile_title()}: {data.subject.Name}</h1>
  {@render children?.()}
{/if}
