<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.prodDefs_addSuccess());
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

<h3 class="pl-4">{m.prodDefs_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput
    key="prodDefs_name"
    class="md:max-w-xs"
    input={{
      name: 'name',
      required: true,
      err: m.formErrors_nameEmpty(),
      icon: Icons.Name
    }}
    bind:value={$form.name}
  />
  <Toggle title={{ key: 'prodDefs_type_allowAll' }} name="allowAll" bind:checked={$form.allowAll} />
  {#if !$form.allowAll}
    <LabeledFormInput key="prodDefs_type" class="border border-warning p-1 my-4 rounded-lg">
      {#each data.options.applicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, locale) ) as type}
        <InputWithMessage
          message={{ key: 'common_passThrough', params: { value: type.Description } }}
          class="my-1"
        >
          <input
            class="toggle toggle-warning border-warning"
            type="checkbox"
            bind:group={$form.applicationTypes}
            value={type.Id}
          />
        </InputWithMessage>
      {/each}
    </LabeledFormInput>
  {:else}
    <div class="mb-4"></div>
  {/if}
  <LabeledFormInput key="prodDefs_flow">
    <select class="select validator" name="workflow" bind:value={$form.workflow} required>
      {#each workflows as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.prodDefs_emptyFlow()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_rebuildFlow">
    <select class="select" name="rebuildWorkflow" bind:value={$form.rebuildWorkflow}>
      <option value={null}>{m.prodDefs_noFlow()}</option>
      {#each rebuildWorkflows as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_republishFlow">
    <select class="select" name="republishWorkflow" bind:value={$form.republishWorkflow}>
      <option value={null}>{m.prodDefs_noFlow()}</option>
      {#each republishWorkflows as wf}
        <option value={wf.Id}>{wf.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_description">
    <textarea
      name="description"
      class="textarea h-36 w-full"
      bind:value={$form.description}
    ></textarea>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_properties">
    <PropertiesEditor
      name="properties"
      class="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
  </LabeledFormInput>
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton disabled={!propsOk} icon={Icons.AddProduct} />
  </div>
</form>

<style>
  select {
    width: 100%;
  }
  @media (width >= 40rem) {
    select {
      max-width: var(--container-xs);
    }
  }
</style>
