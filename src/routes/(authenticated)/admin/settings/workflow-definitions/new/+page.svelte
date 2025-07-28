<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { businessFlows } from '../common';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { WorkflowType } from '$lib/prisma';
  import { enumNumVals, toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';
  import { ProductType, WorkflowOptions } from '$lib/workflowTypes';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/workflow-definitions';

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.flowDefs_added());
      }
    }
  });

  let propsOk = $state(true);
</script>

<h3>{m.flowDefs_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="flowDefs_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_storeType">
    <select
      class="select select-bordered validator"
      name="storeType"
      bind:value={$form.storeType}
      required
    >
      {#each data.options.storeType.toSorted((a, b) => byName(a, b, getLocale())) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.flowDefs_emptyStoreType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_productType">
    <select
      class="select select-bordered validator"
      name="productType"
      bind:value={$form.productType}
      required
    >
      {#each enumNumVals(ProductType) as type}
        <option value={type}>
          {m.flowDefs_productTypes({ type })}
        </option>
      {/each}
    </select>
    <span class="validator-hint">{m.flowDefs_emptyProductType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_type">
    <select
      class="select select-bordered validator"
      name="workflowType"
      bind:value={$form.workflowType}
      required
    >
      {#each enumNumVals(WorkflowType) as type}
        <option value={type}>{m.flowDefs_types({ type })}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.flowDefs_emptyType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_scheme">
    <select class="select select-bordered" name="workflowScheme" bind:value={$form.workflowScheme}>
      {#each data.options.schemes.toSorted( (a, b) => byString(a.Code, b.Code, getLocale()) ) as scheme}
        <option value={scheme.Code}>{scheme.Code}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_businessFlow">
    <select
      class="select select-bordered"
      name="workflowBusinessFlow"
      bind:value={$form.workflowBusinessFlow}
    >
      {#each businessFlows as flow}
        <option value={flow}>{flow}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_properties">
    <PropertiesEditor
      name="properties"
      className="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
  </LabeledFormInput>
  <LabeledFormInput
    key="flowDefs_options_title"
    classes="border border-warning p-1 my-4 rounded-lg"
  >
    {#each enumNumVals(WorkflowOptions) as option}
      <InputWithMessage message={{ key: 'flowDefs_options', params: option }} className="my-1">
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={option}
        />
      </InputWithMessage>
    {/each}
  </LabeledFormInput>
  <InputWithMessage
    title={{ key: 'flowDefs_enabled' }}
    message={{ key: 'flowDefs_enabledDescription' }}
  >
    <input
      name="enabled"
      class="toggle toggle-accent"
      type="checkbox"
      bind:checked={$form.enabled}
    />
  </InputWithMessage>
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} disabled={!propsOk} />
  </div>
</form>

<style>
  input[type='text'],
  select {
    width: 100%;
    max-width: var(--container-xs);
  }
</style>
