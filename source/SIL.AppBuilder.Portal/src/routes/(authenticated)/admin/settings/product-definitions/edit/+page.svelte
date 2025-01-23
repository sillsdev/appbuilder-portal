<script lang="ts">
  import { run } from 'svelte/legacy';

  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import * as m from '$lib/paraglide/messages';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  const { form: superFormData, enhance, allErrors } = superForm(data.form);
  const workflows = data.options.workflows.filter((w) => w.Type === 1);
  const rebuildWorkflows = data.options.workflows.filter((w) => w.Type === 2);
  const republishWorkflows = data.options.workflows.filter((w) => w.Type === 3);

  run(() => {
    if (form?.ok) goto('/admin/settings/product-definitions');
  });
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="admin_settings_productDefinitions_name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_type">
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
  <LabeledFormInput name="admin_settings_productDefinitions_workflow">
    <select class="select select-bordered" name="workflow" bind:value={$superFormData.workflow}>
      {#each workflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_rebuildWorkflow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$superFormData.rebuildWorkflow}
    >
      <option value={null}>{m.admin_settings_productDefinitions_noWorkflow()}</option>
      {#each rebuildWorkflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_republishWorkflow">
    <select
      class="select select-bordered"
      name="republishWorkflow"
      bind:value={$superFormData.republishWorkflow}
    >
      <option value={null}>{m.admin_settings_productDefinitions_noWorkflow()}</option>
      {#each republishWorkflows.filter((w) => w.Type) as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
></textarea>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_properties">
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.properties}
></textarea>
  </LabeledFormInput>
  {#if $allErrors.length}
    <ul>
      {#each $allErrors as error}
        <li class="text-red-500">
          <b>{error.path}:</b>
          {error.messages.join('. ')}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/product-definitions">Cancel</a>
  </div>
</form>
