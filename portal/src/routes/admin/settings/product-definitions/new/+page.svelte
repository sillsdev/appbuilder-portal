<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { form, enhance, message } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/product-definitions');
      }
    }
  });
</script>

<h3>{$_('admin.settings.productDefinitions.add')}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin.settings.productDefinitions.name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.type">
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
  <LabeledFormInput name="admin.settings.productDefinitions.workflow">
    <select class="select select-bordered" name="workflow" bind:value={$form.workflow}>
      {#each data.options.workflows.filter((w) => w.Type === 1) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.rebuildWorkflow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$form.rebuildWorkflow}
    >
      <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
      {#each data.options.workflows.filter((w) => w.Type === 2) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.republishWorkflow">
    <select
      class="select select-bordered"
      name="republishWorkflow"
      bind:value={$form.republishWorkflow}
    >
      <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
      {#each data.options.workflows.filter((w) => w.Type === 3) as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.productDefinitions.properties">
    <input
      type="text"
      name="properties"
      class="input input-bordered w-full"
      bind:value={$form.properties}
    />
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/product-definitions">Cancel</a>
  </div>
</form>
