<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.admin_settings_productDefinitions_addSuccess());
      } else {
        // ISSUE: #1107 Add toasts for server-side errors?
        console.warn(form.errors);
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

  let propsOk = $state(true);
</script>

<h3>{m.admin_settings_productDefinitions_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_productDefinitions_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.admin_settings_productDefinitions_emptyName()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_type">
    <select
      class="select select-bordered validator"
      name="applicationType"
      bind:value={$form.applicationType}
      required
    >
      {#each data.options.applicationTypes as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_productDefinitions_emptyType()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_workflow">
    <select
      class="select select-bordered validator"
      name="workflow"
      bind:value={$form.workflow}
      required
    >
      {#each workflows as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_productDefinitions_emptyWorkflow()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_productDefinitions_rebuildWorkflow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$form.rebuildWorkflow}
    >
      <option value={null}>{m.admin_settings_productDefinitions_noWorkflow()}</option>
      {#each rebuildWorkflows as wf}
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
      {#each republishWorkflows as wf}
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
    <PropertiesEditor name="properties" className="w-full" bind:value={$form.properties} bind:ok={propsOk} />
  </LabeledFormInput>
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} disabled={!propsOk} />
  </div>
</form>
