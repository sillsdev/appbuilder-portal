<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { ProductType, WorkflowOptions } from 'sil.appbuilder.portal.common/workflow';
  import { businessFlows } from '../common';

  export let data: PageData;

  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/workflow-definitions');
      }
    }
  });
</script>

<h3>{m.admin_settings_workflowDefinitions_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_workflowDefinitions_name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_storeType">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.options.storeType as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <div>
    <label>
      <!-- TODO: i18n (add to JSON) -->
      <div class="label">
        <span class="label-text">Product Type</span>
      </div>
      <select
        class="select select-bordered"
        name="productType"
        bind:value={$form.productType}
      >
        <option value={ProductType.Android_GooglePlay}>Android GooglePlay</option>
        <option value={ProductType.Android_S3}>Android S3</option>
        <option value={ProductType.AssetPackage}>Asset Package</option>
        <option value={ProductType.Web}>Web</option>
      </select>
    </label>
  </div>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowType">
    <select class="select select-bordered" name="workflowType" bind:value={$form.workflowType}>
      <option value={1}>{m.admin_settings_workflowDefinitions_workflowTypes_1()}</option>
      <option value={2}>{m.admin_settings_workflowDefinitions_workflowTypes_2()}</option>
      <option value={3}>{m.admin_settings_workflowDefinitions_workflowTypes_3()}</option>
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_workflowDefinitions_workflowScheme">
    <select
      class="select select-bordered"
      name="workflowScheme"
      bind:value={$form.workflowScheme}
    >
      {#each data.options.schemes as scheme}
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
    <input
      type="text"
      name="properties"
      class="input input-bordered w-full"
      bind:value={$form.properties}
    />
  </LabeledFormInput>
  <div>
    <label>
      <!-- TODO: i18n (add to JSON) -->
      <div class="label">
        <span class="">Options</span>
      </div>
      <div class="label flex flex-row">
        <div class="label">
          <span class="label-text">
            Require an organization admin to access the GooglePlay developer console.
          </span>
        </div>
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={WorkflowOptions.AdminStoreAccess}
        />
      </div>
      <div class="label flex flex-row">
        <div class="label">
          <span class="label-text">
            Require approval by an organization admin before product is created.
          </span>
        </div>
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={WorkflowOptions.ApprovalProcess}
        />
      </div>
      <div class="label flex flex-row">
        <div class="label">
          <span class="label-text">
            Allow project owner to delegate configuration and product uploads to authors.
          </span>
        </div>
        <input
          class="toggle toggle-warning border-warning"
          type="checkbox"
          bind:group={$form.options}
          value={WorkflowOptions.AllowTransferToAuthors}
        />
      </div>
    </label>
  </div>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {m.admin_settings_workflowDefinitions_enabled()}
          </span>
          <span class="text-sm">
            {m.admin_settings_workflowDefinitions_enabledDescription()}
          </span>
        </div>
        <input
          name="enabled"
          class="toggle toggle-info"
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
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/workflow-definitions">Cancel</a>
  </div>
</form>
