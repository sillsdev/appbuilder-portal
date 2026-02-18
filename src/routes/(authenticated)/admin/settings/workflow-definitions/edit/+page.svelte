<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { enumNumVals, toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
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
        toast('success', m.flowDefs_updated());
      }
    }
  });

  let propsOk = $state(true);
</script>

<h3 class="pl-4">{m.flowDefs_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput key="flowDefs_name">
    <input
      type="text"
      name="name"
      class="input input-bordered validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_storeType">
    <select class="select validator" name="storeType" bind:value={$form.storeType} required>
      {#each data.storeTypes.toSorted((a, b) => byName(a, b, getLocale())) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.flowDefs_emptyStoreType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_productType">
    <select class="select validator" name="productType" bind:value={$form.productType} required>
      {#each enumNumVals(ProductType) as type}
        <option value={type}>
          {m.flowDefs_productTypes({ type })}
        </option>
      {/each}
    </select>
    <span class="validator-hint">{m.flowDefs_emptyProductType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_description">
    <input
      type="text"
      name="description"
      class="input input-bordered"
      bind:value={$form.description}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_properties">
    <PropertiesEditor
      name="properties"
      class="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_options_title" class="border border-warning p-1 my-4 rounded-lg">
    {#each enumNumVals(WorkflowOptions) as option}
      <InputWithMessage message={{ key: 'flowDefs_options', params: { option } }} class="my-1">
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
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton disabled={!propsOk} />
  </div>
</form>

<style>
  input[type='text'],
  select {
    width: 100%;
  }
  @media (width >= 40rem) {
    input[type='text'],
    select {
      max-width: var(--container-xs);
    }
  }
</style>
