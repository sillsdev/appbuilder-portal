<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  // import SuperDebug, { superForm } from 'sveltekit-superforms';

  export let data: PageData;

  // const { form, enhance } = superForm(data.form);

  // function edit(item: PageData['productDefinitions'][0]) {
  //   form.set({
  //     applicationType: item.TypeId,
  //     description: item.Description ?? '',
  //     id: item.Id,
  //     name: item.Name ?? '',
  //     properties: item.Properties ?? '',
  //     rebuildWorkflow: item.RebuildWorkflowId,
  //     republishWorkflow: item.RepublishWorkflowId,
  //     workflow: item.WorkflowId
  //   });
  //   editing = true;
  // }

  // let editing = false;
</script>

<a href="product-definitions/new" class="btn btn-outline rounded-none m-4 mt-0">
  {$_('admin.settings.productDefinitions.add')}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as pD}
    <DataDisplayBox
      editable
      on:edit={() => goto(base + '/admin/settings/product-definitions/edit?id=' + pD.Id)}
      title={pD.Name}
      fields={[
        {
          key: 'admin.settings.productDefinitions.type',
          value: pD.ApplicationTypes.Name
        },
        {
          key: 'admin.settings.productDefinitions.workflow',
          value: pD.Workflow.Name
        },
        {
          key: 'admin.settings.productDefinitions.rebuildWorkflow',
          value: pD.RebuildWorkflow?.Name
        },
        {
          key: 'admin.settings.productDefinitions.republishWorkflow',
          value: pD.RepublishWorkflow?.Name
        },
        {
          key: 'admin.settings.productDefinitions.description',
          value: pD.Description
        }
      ]}
    />
  {/each}
</div>
