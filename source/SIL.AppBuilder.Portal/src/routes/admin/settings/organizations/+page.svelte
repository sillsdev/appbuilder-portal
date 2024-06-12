<script lang="ts">
  import type { PageData } from './$types';
  import { _ } from 'svelte-i18n';
  import InternationalizedDataBox from '$lib/components/InternationalizedDataBox.svelte';

  export let data: PageData;
</script>

<div class="flex grow flex-col">
  <h2>{$_('admin.settings.organizations.title')}</h2>

  <div class="btn btn-outline rounded-none m-4 mt-0">
    {$_('admin.settings.organizations.add')}
  </div>

  <div class="flex flex-col w-full">
    {#each data.organizations as organization}
      <InternationalizedDataBox
        title={organization.Name}
        fields={[
          { key: 'admin.settings.organizations.owner', value: organization.Owner.Name },
          {
            key: 'admin.settings.organizations.buildEngineURL',
            value: organization.WebsiteUrl
          },
          {
            key: 'admin.settings.organizations.accessToken',
            value: organization.BuildEngineApiAccessToken
          }
        ]}
      />
    {/each}
  </div>
</div>
