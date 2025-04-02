<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { enumNumVals } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';
  import { WorkflowType } from 'sil.appbuilder.portal.common/prisma';
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
      {#each enumNumVals(ProductType) as type}
        <option value={type}>
          {m.admin_settings_workflowDefinitions_productTypes({ type })}
        </option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowType">
    <select class="select select-bordered" name="workflowType" bind:value={$form.workflowType}>
      {#each enumNumVals(WorkflowType) as type}
        <option value={type}>{m.admin_settings_workflowDefinitions_workflowTypes({ type })}</option>
      {/each}
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
