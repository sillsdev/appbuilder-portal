<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import { getProductIcon, getStoreIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
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
        toast('success', m.flowDefs_updated());
      }
    }
  });

  let propsOk = $state(true);

  const mobileSizing = 'w-full md:max-w-xs';
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
    <SelectWithIcon
      bind:value={$form.storeType}
      items={data.storeTypes
        .toSorted((a, b) => byString(a.Description, b.Description, getLocale()))
        .map((st) => ({ ...st, Name: st.Description ?? st.Name, icon: getStoreIcon(st.Id) }))}
      class="validator {mobileSizing}"
      attr={{ name: 'storeType', required: true }}
    />
    <span class="validator-hint">{m.flowDefs_emptyStoreType()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="flowDefs_productType">
    <SelectWithIcon
      bind:value={$form.productType}
      items={enumNumVals(ProductType)
        .map((type) => ({
          Id: type,
          Name: m.flowDefs_productTypes({ type }),
          icon: getProductIcon(type)
        }))
        .toSorted((a, b) => byName(a, b, getLocale()))}
      class="validator {mobileSizing}"
      attr={{ name: 'productType', required: true }}
    />
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
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} disabled={!propsOk} />
  </div>
</form>

<style>
  input[type='text'] {
    width: 100%;
  }
  @media (width >= 40rem) {
    input[type='text'] {
      max-width: var(--container-xs);
    }
  }
</style>
