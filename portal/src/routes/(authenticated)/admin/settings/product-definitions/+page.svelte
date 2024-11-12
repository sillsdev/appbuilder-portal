<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<a href="product-definitions/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_productDefinitions_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? '', languageTag()) ?? 0) as pD}
    <DataDisplayBox
      editable
      on:edit={() => goto(base + '/admin/settings/product-definitions/edit?id=' + pD.Id)}
      title={pD.Name}
      fields={[
        {
          key: 'admin_settings_productDefinitions_type',
          value: pD.ApplicationTypes.Name
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
