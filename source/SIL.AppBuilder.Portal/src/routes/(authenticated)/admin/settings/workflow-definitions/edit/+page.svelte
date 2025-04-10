<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { enumNumVals, toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';
  import { ProductType, WorkflowOptions } from 'sil.appbuilder.portal.common/workflow';
  import { superForm } from 'sveltekit-superforms';
  import { businessFlows } from '../common';
  import type { PageData } from './$types';

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
        toast('success', m.admin_settings_workflowDefinitions_workflowUpdated());
      } else {
        // ISSUE: #1107 Add toasts for server-side errors?
        console.warn(form.errors);
      }
    }
  });

  let propsOk = $state(true);
</script>

<h3>{m.admin_settings_workflowDefinitions_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_workflowDefinitions_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.admin_settings_productDefinitions_emptyName()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_storeType">
    <select
      class="select select-bordered validator"
      name="storeType"
      bind:value={$form.storeType}
      required
    >
      {#each data.storeTypes.toSorted((a, b) => byName(a, b, getLocale())) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_workflowDefinitions_emptyStoreType()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_productType">
    <select
      class="select select-bordered validator"
      name="productType"
      bind:value={$form.productType}
      required
    >
      {#each enumNumVals(ProductType) as type}
        <option value={type}>
          {m.admin_settings_workflowDefinitions_productTypes({ type })}
        </option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_workflowDefinitions_emptyProductType()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$form.description}
    ></textarea>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowScheme">
    <select class="select select-bordered" name="workflowScheme" bind:value={$form.workflowScheme}>
      {#each data.schemes.toSorted((a, b) => byString(a.Code, b.Code, getLocale())) as scheme}
        <option value={scheme.Code}>{scheme.Code}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowBusinessFlow">
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
  <LabeledFormInput name="admin_settings_workflowDefinitions_properties">
    <PropertiesEditor
      name="properties"
      className="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
  </LabeledFormInput>
  <LabeledFormInput
    name="admin_settings_workflowDefinitions_options_title"
    className="border border-warning p-1 my-4 rounded-lg"
  >
    {#each enumNumVals(WorkflowOptions) as option}
      <InputWithMessage
        name="admin_settings_workflowDefinitions_options"
        messageParms={{ option }}
        className="my-1"
      >
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={option}
        />
      </InputWithMessage>
    {/each}
  </LabeledFormInput>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col grow">
          <span class="">
            {m.admin_settings_workflowDefinitions_enabled()}
          </span>
          <span class="text-sm">
            {m.admin_settings_workflowDefinitions_enabledDescription()}
          </span>
        </div>
        <input
          name="enabled"
          class="toggle toggle-accent"
          type="checkbox"
          bind:checked={$form.enabled}
        />
      </div>
    </label>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} disabled={!propsOk} />
    <a class="btn" href={localizeHref(base)}>{m.common_cancel()}</a>
  </div>
</form>

<style>
  input[type='text'],
  select {
    width: 100%;
    max-width: var(--container-xs);
  }
</style>
