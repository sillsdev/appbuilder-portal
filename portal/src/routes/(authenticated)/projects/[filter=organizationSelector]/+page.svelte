<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import OrganizationSelector from '$lib/components/OrganizationSelector.svelte';
  import * as m from '$lib/paraglide/messages';
</script>

<div class="w-full max-w-6xl mx-auto">
  <h1 class="pl-7">{m.projects_switcher_dropdown_orgProjects()}</h1>
  <OrganizationSelector
    organizations={$page.data.organizations}
    on:select={(id) => goto($page.url.pathname + '/' + id.detail.id)}
  />
</div>
