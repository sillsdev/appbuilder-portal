<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import type { ValidI13nKey } from '$lib/i18n';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
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

  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(base));
      }
    }
  });

  const workflowOptions: { message: ValidI13nKey; value: WorkflowOptions }[] = [
    {
      message: 'admin_settings_workflowDefinitions_options_storeAccess',
      value: WorkflowOptions.AdminStoreAccess
    },
    {
      message: 'admin_settings_workflowDefinitions_options_approval',
      value: WorkflowOptions.ApprovalProcess
    },
    {
      message: 'admin_settings_workflowDefinitions_options_transferToAuthors',
      value: WorkflowOptions.AllowTransferToAuthors
    }
  ];
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_workflowDefinitions_name">
    <input class="input w-full input-bordered" type="text" name="name" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_storeType">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.storeTypes.toSorted((a, b) => byName(a, b, getLocale())) as storeType}
        <option value={storeType.Id}>{storeType.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_productType">
    <select class="select select-bordered" name="productType" bind:value={$form.productType}>
      <option value={ProductType.Android_GooglePlay}>Android GooglePlay</option>
      <option value={ProductType.Android_S3}>Android S3</option>
      <option value={ProductType.AssetPackage}>
        {m.admin_settings_workflowDefinitions_productType_assetPackage()}
      </option>
      <option value={ProductType.Web}>
        {m.admin_settings_workflowDefinitions_productType_web()}
      </option>
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowType">
    <select class="select select-bordered" name="workflowType" bind:value={$form.workflowType}>
      <option value={1}>{m.admin_settings_workflowDefinitions_workflowTypes_1()}</option>
      <option value={2}>{m.admin_settings_workflowDefinitions_workflowTypes_2()}</option>
      <option value={3}>{m.admin_settings_workflowDefinitions_workflowTypes_3()}</option>
    </select>
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
    <textarea
      name="properties"
      class="textarea textarea-bordered w-full"
      bind:value={$form.properties}
    ></textarea>
  </LabeledFormInput>
  <LabeledFormInput
    name="admin_settings_workflowDefinitions_options"
    className="border border-warning p-1 my-4 rounded-lg"
  >
    {#each workflowOptions as opt}
      <InputWithMessage name={opt.message} className="my-1">
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={opt.value}
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
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
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
