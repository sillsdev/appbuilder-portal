<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';
</script>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.admin_settings_productDefinitions_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as pD}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${pD.Id}`))}
      title={pD.Name}
      fields={[
        {
          key: 'admin_settings_productDefinitions_type',
          value: pD.ApplicationTypes.Name // TODO: this doesn't actually mean anything for the product definition, so we may want to remove this entirely from the UI.
        },
        {
          key: 'admin_settings_productDefinitions_workflow',
          value: pD.Workflow.Name
        },
        {
          key: 'admin_settings_productDefinitions_rebuildWorkflow',
          value: pD.RebuildWorkflow?.Name
        },
        {
          key: 'admin_settings_productDefinitions_republishWorkflow',
          value: pD.RepublishWorkflow?.Name
        },
        {
          key: 'admin_settings_productDefinitions_description',
          value: pD.Description
        }
      ]}
    />
  {/each}
</div>
