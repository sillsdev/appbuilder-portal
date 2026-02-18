<script lang="ts">
  import type { PageData } from './$types';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const base = '/admin/settings/organizations';
</script>

<h2>{m.org_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  <IconContainer icon="material-symbols:add" width={20} />
  {m.org_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.organizations.toSorted((a, b) => byName(a, b, getLocale())) as organization}
    <DataDisplayBox
      editable
      editLink={localizeHref(`${base}/edit?id=${organization.Id}`)}
      title={organization.Name}
      fields={[
        { key: 'project_orgContact', value: organization.ContactEmail },
        {
          key: 'org_websiteURL',
          value: organization.WebsiteUrl
        },
        {
          key: 'org_useDefaultBuildEngine',
          value: '' + organization.UseDefaultBuildEngine
        },
        {
          key: 'org_buildEngineURL',
          value: organization.BuildEngineUrl,
          faint: !!organization.UseDefaultBuildEngine
        },
        {
          key: 'org_accessToken',
          value: organization.BuildEngineApiAccessToken,
          faint: !!organization.UseDefaultBuildEngine
        }
      ]}
    />
  {/each}
</div>
