<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import OrganizationSelector from '$lib/components/OrganizationSelector.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="w-full max-w-6xl mx-auto">
  <h1 class="pl-7">{m.org_settingsTitle()}</h1>
  <OrganizationSelector
    organizations={data.organizations}
    on:select={({ detail }) => goto($page.url.pathname + '/' + detail.id + '/settings/info')}
  />
</div>
