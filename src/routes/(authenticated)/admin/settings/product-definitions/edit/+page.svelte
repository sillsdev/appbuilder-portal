<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.prodDefs_editSuccess());
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

<h3>{m.prodDefs_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput key="prodDefs_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_type">
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
    <span class="validator-hint">{m.prodDefs_emptyType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_flow">
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
    <span class="validator-hint">{m.prodDefs_emptyFlow()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_rebuildFlow">
    <select
      class="select select-bordered"
      name="rebuildWorkflow"
      bind:value={$form.rebuildWorkflow}
    >
      <option value={null}>{m.prodDefs_noFlow()}</option>
      {#each rebuildWorkflows as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_republishFlow">
    <select
      class="select select-bordered"
      name="republishWorkflow"
      bind:value={$form.republishWorkflow}
    >
      <option value={null}>{m.prodDefs_noFlow()}</option>
      {#each republishWorkflows as workflow}
        <option value={workflow.Id}>{workflow.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_description">
    <textarea
      name="description"
      class="textarea textarea-bordered h-36 w-full"
      bind:value={$form.description}
    ></textarea>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_properties">
    <PropertiesEditor
      name="properties"
      className="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
  </LabeledFormInput>
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} disabled={!propsOk} />
  </div>
</form>
