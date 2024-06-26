<script lang="ts">
  import type { PageData } from './$types';
  import * as m from "$lib/paraglide/messages";
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<a href="organizations/new" class="btn btn-outline rounded-none m-4 mt-0">
  {m.admin_settings_organizations_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.organizations as organization}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/organizations/edit?id=' + organization.Id)}
      title={organization.Name}
      fields={[
        { key: 'admin_settings_organizations_owner', value: organization.Owner.Name },
        {
          key: 'admin_settings_organizations_websiteURL',
          value: organization.WebsiteUrl
        },
        {
          key: 'admin_settings_organizations_buildEngineURL',
          value: organization.BuildEngineUrl
        },
        {
          key: 'admin_settings_organizations_accessToken',
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
