<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import type { PageData } from './$types';
  import { _ } from 'svelte-i18n';

  export let data: PageData;
</script>

<a href="workflow-definitions/new" class="btn btn-outline rounded-none m-4 mt-0">
  {$_('admin.settings.workflowDefinitions.add')}
</a>

<div class="flex flex-col w-full">
  {#each data.workflowDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as wd}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/workflow-definitions/edit?id=' + wd.Id)}
      title={wd.Name}
      fields={[
        {
          key: 'admin.settings.workflowDefinitions.description',
          value: wd.Description
        },
        {
          key: 'admin.settings.workflowDefinitions.storeType',
          value: wd.StoreType?.Name
        },
        {
          key: 'admin.settings.workflowDefinitions.workflowType',
          value: $_('admin.settings.workflowDefinitions.workflowTypes.' + wd.Type)
        },
        {
          key: 'admin.settings.workflowDefinitions.workflowScheme',
          value: wd.WorkflowScheme
        },
        {
          key: 'admin.settings.workflowDefinitions.workflowBusinessFlow',
          value: wd.WorkflowBusinessFlow
        }
      ]}
    />
  {/each}
</div>
