<!--
    @component
    A settings menu
    
-->
<script lang="ts">
  import { base } from '$app/paths';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import * as m from '$lib/paraglide/messages';

  let adminLinks = [
    { text: m.admin_settings_navigation_organizations(), route: 'organizations' },
    { text: m.admin_settings_navigation_workflowdefinitions(), route: 'workflow-definitions' },
    { text: m.admin_settings_navigation_productDefinitions(), route: 'product-definitions' },
    { text: m.admin_settings_navigation_stores(), route: 'stores' },
    { text: m.admin_settings_navigation_storeTypes(), route: 'store-types' },
    { text: m.admin_settings_navigation_buildEngines(), route: 'build-engines' }
  ];
</script>

<form action="/admin/settings" method="post">
  <button type="submit" class="btn btn-primary">Add Test BullMQ task</button>
</form>

<TabbedMenu
  routeId="/(authenticated)/admin/settings"
  base="{base}/admin/settings"
  title={m.admin_settings_title()}
  menuItems={adminLinks}
>
  <slot />
</TabbedMenu>
