<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<a href="organizations/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_organizations_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.organizations.toSorted((a, b) => byName(a, b, languageTag())) as organization}
    <DataDisplayBox
      editable
      onEdit={() => goto('/admin/settings/organizations/edit?id=' + organization.Id)}
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
    />
  {/each}
</div>
