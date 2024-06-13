<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import { _ } from 'svelte-i18n';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance } = superForm(data.form);
  const workflows = data.options.workflows.filter((w) => w.Type === 1);
  const rebuildWorkflows = data.options.workflows.filter((w) => w.Type === 2);
  const republishWorkflows = data.options.workflows.filter((w) => w.Type === 3);

  $: if (form?.ok) goto('/admin/settings/product-definitions');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="admin.settings.productDefinitions.name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.type">
    <select
      class="select select-bordered"
      name="applicationType"
      bind:value={$superFormData.applicationType}
    >
      {#each data.options.applicationTypes as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.workflow">
    <select class="select select-bordered" name="workflow" bind:value={$superFormData.workflow}>
      {#each workflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.rebuildWorkflow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$superFormData.rebuildWorkflow}
    >
      <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
      {#each rebuildWorkflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.republishWorkflow">
    <select
      class="select select-bordered"
      name="republishWorkflow"
      bind:value={$superFormData.republishWorkflow}
    >
      <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
      {#each republishWorkflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.properties">
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.properties}
    />
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/product-definitions">Cancel</a>
  </div>
</form>
