<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(base));
      }
    }
  });

  const locale = getLocale();

  const workflows = data.options.workflows
    .filter((w) => w.Type === 1)
    .sort((a, b) => byName(a, b, locale));
  const rebuildWorkflows = data.options.workflows
    .filter((w) => w.Type === 2)
    .sort((a, b) => byName(a, b, locale));
  const republishWorkflows = data.options.workflows
    .filter((w) => w.Type === 3)
    .sort((a, b) => byName(a, b, locale));
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_productDefinitions_name">
    <input class="input w-full input-bordered" type="text" name="name" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_type">
    <select
      class="select select-bordered"
      name="applicationType"
      bind:value={$form.applicationType}
    >
      {#each data.options.applicationTypes.toSorted((a, b) => byName(a, b, locale)) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_workflow">
    <select class="select select-bordered" name="workflow" bind:value={$form.workflow}>
      {#each workflows as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
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
      {#each rebuildWorkflows as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
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
      {#each republishWorkflows as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$form.description}
    ></textarea>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_properties">
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$form.properties}
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
    <a class="btn" href={localizeHref(base)}>Cancel</a>
  </div>
</form>
