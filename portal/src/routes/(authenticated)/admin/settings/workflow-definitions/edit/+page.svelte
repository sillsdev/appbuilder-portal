<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import { _ } from 'svelte-i18n';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance, allErrors } = superForm(data.form);

  $: if (form?.ok) goto('/admin/settings/workflow-definitions');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="admin.settings.workflowDefinitions.name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.storeType">
    <select class="select select-bordered" name="storeType" bind:value={$superFormData.storeType}>
      {#each data.options as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowType">
    <select
      class="select select-bordered"
      name="workflowType"
      bind:value={$superFormData.workflowType}
    >
      <option value={1}>{$_('admin.settings.workflowDefinitions.workflowTypes.1')}</option>
      <option value={2}>{$_('admin.settings.workflowDefinitions.workflowTypes.2')}</option>
      <option value={3}>{$_('admin.settings.workflowDefinitions.workflowTypes.3')}</option>
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowScheme">
    <input
      class="input w-full input-bordered"
      type="text"
      name="workflowScheme"
      bind:value={$superFormData.workflowScheme}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.workflowBusinessFlow">
    <input
      class="input w-full input-bordered"
      type="text"
      name="workflowBusinessFlow"
      bind:value={$superFormData.workflowBusinessFlow}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.workflowDefinitions.properties">
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.properties}
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
          bind:checked={$superFormData.enabled}
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
