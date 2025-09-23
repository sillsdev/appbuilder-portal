<script lang="ts">
  import { type RouteParams } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import OrganizationSelector from '$lib/components/OrganizationSelector.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="py-4 pl-2">
    <ProjectFilterSelector filter={(page.params as RouteParams).filter} />
  </div>
  <!-- <h1 class="pl-7">{m.projects_switcher_dropdown_orgProjects()}</h1> -->
  <OrganizationSelector
    organizations={page.data.organizations}
    onSelect={(id) => goto(page.url.pathname + '/' + id)}
  />
</div>
