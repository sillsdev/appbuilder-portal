<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/workflow-definitions');
      }
    }
  });
</script>

<h3>{$_('admin.settings.workflowDefinitions.add')}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin.settings.workflowDefinitions.name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.storeType">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.options.storeType as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowType">
    <select class="select select-bordered" name="workflowType" bind:value={$form.workflowType}>
      <option value={1}>{$_('admin.settings.workflowDefinitions.workflowTypes.1')}</option>
      <option value={2}>{$_('admin.settings.workflowDefinitions.workflowTypes.2')}</option>
      <option value={3}>{$_('admin.settings.workflowDefinitions.workflowTypes.3')}</option>
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowScheme">
    <input
      type="text"
      name="workflowScheme"
      class="input input-bordered w-full"
      bind:value={$form.workflowScheme}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowBusinessFlow">
    <input
      type="text"
      name="workflowBusinessFlow"
      class="input input-bordered w-full"
      bind:value={$form.workflowBusinessFlow}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.properties">
    <input
      type="text"
      name="properties"
      class="input input-bordered w-full"
      bind:value={$form.properties}
    />
  </LabeledFormInput>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {$_('admin.settings.workflowDefinitions.enabled')}
          </span>
          <span class="text-sm">
            {$_('admin.settings.workflowDefinitions.enabledDescription')}
          </span>
        </div>
        <input
          name="enabled"
          class="toggle toggle-info"
          type="checkbox"
          bind:checked={$form.enabled}
        />
      </div>
    </label>
  </div>
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
    <a class="btn" href="/admin/settings/workflow-definitions">Cancel</a>
  </div>
</form>
