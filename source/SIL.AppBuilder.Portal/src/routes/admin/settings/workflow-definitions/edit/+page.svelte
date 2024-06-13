<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import { _ } from 'svelte-i18n';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import InternationalizedInput from '$lib/components/InternationalizedInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance } = superForm(data.form);

  $: if (form?.ok) goto('/admin/settings/workflow-definitions');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <InternationalizedInput name="admin.settings.workflowDefinitions.name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.storeType">
    <select class="select select-bordered" name="storeType" bind:value={$superFormData.storeType}>
      {#each data.options as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.workflowType">
    <select
      class="select select-bordered"
      name="workflowType"
      bind:value={$superFormData.workflowType}
    >
      <option value={1}>{$_('admin.settings.workflowDefinitions.workflowTypes.1')}</option>
      <option value={2}>{$_('admin.settings.workflowDefinitions.workflowTypes.2')}</option>
      <option value={3}>{$_('admin.settings.workflowDefinitions.workflowTypes.3')}</option>
    </select>
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.workflowScheme">
    <input
      class="input w-full input-bordered"
      type="text"
      name="workflowScheme"
      bind:value={$superFormData.workflowScheme}
    />
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.workflowBusinessFlow">
    <input
      class="input w-full input-bordered"
      type="text"
      name="workflowBusinessFlow"
      bind:value={$superFormData.workflowBusinessFlow}
    />
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.properties">
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.properties}
    />
  </InternationalizedInput>
  <InternationalizedInput name="admin.settings.workflowDefinitions.enabled">
    <input
      type="checkbox"
      class="toggle toggle-info"
      name="enabled"
      bind:checked={$superFormData.enabled}
    />
  </InternationalizedInput>
  <div>
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/workflow-definitions">Cancel</a>
  </div>
</form>
