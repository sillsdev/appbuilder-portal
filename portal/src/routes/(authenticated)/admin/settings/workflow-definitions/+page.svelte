<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { sortByName } from '$lib/utils';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<a href="workflow-definitions/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_workflowDefinitions_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.workflowDefinitions.sort((a, b) => sortByName(a, b, languageTag())) as wd}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/workflow-definitions/edit?id=' + wd.Id)}
      title={wd.Name}
      fields={[
        {
          key: 'admin_settings_workflowDefinitions_description',
          value: wd.Description
        },
        {
          key: 'admin_settings_workflowDefinitions_storeType',
          value: wd.StoreType?.Name
        },
        {
          key: 'admin_settings_workflowDefinitions_productType',
          value: [
            'Android GooglePlay',
            'Android S3',
            m.admin_settings_workflowDefinitions_productType_assetPackage(),
            m.admin_settings_workflowDefinitions_productType_web()
          ][wd.ProductType]
        },
        {
          key: 'admin_settings_workflowDefinitions_workflowType',
          value: [
            ,
            m.admin_settings_workflowDefinitions_workflowTypes_1(),
            m.admin_settings_workflowDefinitions_workflowTypes_2(),
            m.admin_settings_workflowDefinitions_workflowTypes_3()
          ][wd.Type]
        },
        // Do we want to show options here?
      ]}
    />
  {/each}
</div>
