<script lang="ts">
  import type { PageData } from './$types';
  import { _ } from 'svelte-i18n';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<div class="btn btn-outline rounded-none m-4 mt-0">
  {$_('admin.settings.organizations.add')}
</div>

<div class="flex flex-col w-full">
  {#each data.organizations as organization}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/organizations/edit?id=' + organization.Id)}
      title={organization.Name}
      fields={[
        { key: 'admin.settings.organizations.owner', value: organization.Owner.Name },
        {
          key: 'admin.settings.organizations.websiteURL',
          value: organization.WebsiteUrl
        },
        {
          key: 'admin.settings.organizations.buildEngineURL',
          value: organization.WebsiteUrl
        },
        {
          key: 'admin.settings.organizations.accessToken',
          value: organization.BuildEngineApiAccessToken
        }
      ]}
    >
      <button
        class="absolute top-2 right-10"
        title="Switch context"
        on:click={() => {
          alert('#TODO 😊');
          window.location.href = 'https://youtu.be/dQw4w9WgXcQ';
        }}
      >
        <Icon width="24" icon="mdi:sync" />
      </button>
    </DataDisplayBox>
  {/each}
</div>
