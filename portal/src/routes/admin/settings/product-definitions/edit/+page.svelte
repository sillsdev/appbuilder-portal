<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import { _ } from 'svelte-i18n';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance } = superForm(data.form);
  const workflows = data.options.workflows.filter((w) => w.Type === 1);
  const rebuildWorkflows = data.options.workflows.filter((w) => w.Type === 2);
  const republishWorkflows = data.options.workflows.filter((w) => w.Type === 3);

  $: if (form?.ok) goto('/admin/settings/product-definitions');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.name')}</span>
      </div>
      <input
        class="input w-full input-bordered"
        type="text"
        name="name"
        bind:value={$superFormData.name}
      />
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.type')}</span>
      </div>
      <select
        class="select select-bordered"
        name="applicationType"
        bind:value={$superFormData.applicationType}
      >
        {#each data.options.applicationTypes as type}
          <option value={type.Id}>{type.Name}</option>
        {/each}
      </select>
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.workflow')}</span>
      </div>
      <select class="select select-bordered" name="workflow" bind:value={$superFormData.workflow}>
        {#each workflows.filter((w) => w.Type) as workflow}
          <option value={workflow.Id}>{workflow.Name}</option>
        {/each}
      </select>
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.rebuildWorkflow')}</span>
      </div>
      <select
        class="select select-bordered"
        name="rebuildWorkflow"
        bind:value={$superFormData.rebuildWorkflow}
      >
        <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
        {#each rebuildWorkflows.filter((w) => w.Type) as workflow}
          <option value={workflow.Id}>{workflow.Name}</option>
        {/each}
      </select>
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.republishWorkflow')}</span>
      </div>
      <select
        class="select select-bordered"
        name="republishWorkflow"
        bind:value={$superFormData.republishWorkflow}
      >
        <option value={null}>{$_('admin.settings.productDefinitions.noWorkflow')}</option>
        {#each republishWorkflows.filter((w) => w.Type) as workflow}
          <option value={workflow.Id}>{workflow.Name}</option>
        {/each}
      </select>
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.description')}</span>
      </div>
      <textarea
        name="description"
        class="textarea textarea-bordered w-full"
        bind:value={$superFormData.description}
      />
    </label>
  </div>
  <div>
    <label>
      <div class="label">
        <span class="label-text">{$_('admin.settings.productDefinitions.properties')}</span>
      </div>
      <textarea
        name="properties"
        class="textarea textarea-bordered w-full"
        bind:value={$superFormData.properties}
      />
    </label>
  </div>
  <div>
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings">Cancel</a>
  </div>
</form>
