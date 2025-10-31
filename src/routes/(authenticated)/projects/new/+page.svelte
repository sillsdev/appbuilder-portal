<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import OrganizationTable from '$lib/components/OrganizationTable.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="w-full max-w-6xl mx-auto">
  <h1 class="pl-7">{m.project_newProject()}</h1>
  <div class="w-full px-4">
    <OrganizationTable
      organizations={data.organizations}
      onOrgSelected={(orgId) => goto(`${page.url.pathname}/${orgId}`)}
    />
  </div>
</div>
