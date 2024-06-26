<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { base } from '$app/paths';
  import { page } from '$app/stores';

  let adminLinks = [
    { text: m.admin_settings_navigation_organizations(), route: 'organizations' },
    { text: m.admin_settings_navigation_workflowdefinitions(), route: 'workflow-definitions' },
    { text: m.admin_settings_navigation_productDefinitions(), route: 'product-definitions' },
    { text: m.admin_settings_navigation_stores(), route: 'stores' },
    { text: m.admin_settings_navigation_storeTypes(), route: 'store-types' },
    { text: m.admin_settings_navigation_buildEngines(), route: 'build-engines' }
  ];

  function isActive(currentRoute: string | null, menuRoute: string) {
    return currentRoute?.startsWith(`${base}/(authenticated)/admin/settings/${menuRoute}`);
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="flex flex-row">
    <div class="p-4 sticky top-0 self-start">
      <!-- No idea why tailwind text-nowrap won't work, but this does -->
      <h1 class="p-4 [text-wrap:nowrap]">{m.admin_settings_title()}</h1>
      <ul class="menu p-0 rounded border border-slate-600">
        {#each adminLinks as adminLink}
          <li class="w-60 border-t border-slate-600 w-full [top:-1px]">
            <a
              class="rounded-none bg-base-200 p-3"
              class:active={isActive($page.route.id, adminLink.route)}
              href="{base}/admin/settings/{adminLink.route}">{adminLink.text}</a
            >
          </li>
        {/each}
      </ul>
    </div>
    <div class="flex grow mt-16">
      <div class="flex grow flex-col">
        <slot />
      </div>
    </div>
  </div>
</div>
