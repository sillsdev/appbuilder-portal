<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { getProductIcon } from '$lib/icons';
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
    .sort((a, b) => byName(a, b, locale))
    .map((w) => ({ ...w, icon: getProductIcon(w.ProductType) }));
  const rebuildWorkflows = data.options.workflows
    .filter((w) => w.Type === 2)
    .sort((a, b) => byName(a, b, locale))
    .map((w) => ({ ...w, icon: getProductIcon(w.ProductType) }));
  const republishWorkflows = data.options.workflows
    .filter((w) => w.Type === 3)
    .sort((a, b) => byName(a, b, locale))
    .map((w) => ({ ...w, icon: getProductIcon(w.ProductType) }));

  let propsOk = $state(true);

  const mobileSizing = 'w-full md:max-w-xs';
</script>

<h3 class="pl-4">{m.prodDefs_add()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="prodDefs_name">
    <input
      type="text"
      name="name"
      class="input input-bordered validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
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
    <SelectWithIcon
      bind:value={$form.workflow}
      items={workflows}
      class="validator {mobileSizing}"
      attr={{ name: 'workflow', required: true }}
    />
    <span class="validator-hint">{m.prodDefs_emptyFlow()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_rebuildFlow">
    <SelectWithIcon
      bind:value={$form.rebuildWorkflow}
      items={rebuildWorkflows}
      class="validator {mobileSizing}"
      attr={{ name: 'rebuildWorkflow' }}
    >
      {#snippet extra()}
        <option value={null}>{m.prodDefs_noFlow()}</option>
      {/snippet}
    </SelectWithIcon>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="prodDefs_republishFlow">
    <SelectWithIcon
      bind:value={$form.republishWorkflow}
      items={republishWorkflows}
      class="validator {mobileSizing}"
      attr={{ name: 'republishWorkflow' }}
    >
      {#snippet extra()}
        <option value={null}>{m.prodDefs_noFlow()}</option>
      {/snippet}
    </SelectWithIcon>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_description">
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
      class="w-full"
      bind:value={$form.properties}
      bind:ok={propsOk}
    />
  </LabeledFormInput>
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
