<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/product-definitions');
      }
    }
  });
</script>

<h3>{m.admin_settings_productDefinitions_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_productDefinitions_name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_type">
    <select
      class="select select-bordered"
      name="applicationType"
      bind:value={$form.applicationType}
    >
      {#each data.options.applicationTypes as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_workflow">
    <select class="select select-bordered" name="workflow" bind:value={$form.workflow}>
      {#each data.options.workflows.filter((w) => w.Type === 1) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_rebuildWorkflow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$form.rebuildWorkflow}
    >
      <option value={null}>{m.admin_settings_productDefinitions_noWorkflow()}</option>
      {#each data.options.workflows.filter((w) => w.Type === 2) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_republishWorkflow">
    <select
      class="select select-bordered"
      name="republishWorkflow"
      bind:value={$form.republishWorkflow}
    >
      <option value={null}>{m.admin_settings_productDefinitions_noWorkflow()}</option>
      {#each data.options.workflows.filter((w) => w.Type === 3) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_properties">
    <input
      type="text"
      name="properties"
      class="input input-bordered w-full"
      bind:value={$form.properties}
    />
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
