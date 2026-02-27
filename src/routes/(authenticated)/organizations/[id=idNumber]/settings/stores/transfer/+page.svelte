<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { type IconType, Icons, getProductIcon, getStoreIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { StoreType } from '$lib/prisma';
  import { toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = $derived(`/organizations/${data.organization.Id}/settings/stores`);

  let storeType: number = $state(StoreType.GooglePlay);

  const stores = $derived(
    data.stores
      .filter((s) => s.StoreTypeId === storeType)
      .toSorted((a, b) =>
        byString(
          a.Description || a.BuildEnginePublisherId,
          b.Description || b.BuildEnginePublisherId,
          getLocale()
        )
      )
      .map((s) => ({
        ...s,
        Name: s.Description || s.BuildEnginePublisherId,
        icon: getStoreIcon(s.StoreTypeId) as IconType
      }))
  );

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onChange({ paths }) {
      if (paths.includes('source')) {
        $form.products = [];
        if ($form.source === $form.destination) {
          $form.destination = 0;
        }
      }
    },
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.common_updated());
      }
    }
  });

  const mobileSizing = 'w-full md:max-w-xs';
</script>

<h2>{m.org_storesTransfer()}</h2>
<p class="p-4 pt-0">{m.org_storesTransferDescription()}</p>

<form class="m-4" method="post" action="?/transfer" use:enhance>
  <LabeledFormInput key="common_type">
    <SelectWithIcon
      bind:value={storeType}
      items={data.storeTypes
        .toSorted((a, b) => byString(a.Description, b.Description, getLocale()))
        .map((st) => ({ ...st, Name: st.Description || st.Name, icon: getStoreIcon(st.Id) }))}
      class="validator {mobileSizing}"
      attr={{ name: 'storeType' }}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="org_storesTransfer_source">
    <SelectWithIcon
      bind:value={$form.source}
      items={stores}
      class="validator {mobileSizing}"
      attr={{ name: 'source', required: true }}
    />
    <span class="validator-hint">
      {m.errors_requiredField({ field: m.org_storesTransfer_source() })}
    </span>
  </LabeledFormInput>
  <LabeledFormInput key="org_storesTransfer_destination">
    <SelectWithIcon
      bind:value={$form.destination}
      items={stores.map((s) => ({ ...s, attr: { disabled: s.Id === $form.source } }))}
      class="validator {mobileSizing}"
      attr={{ name: 'destination', required: true }}
    />
    <span class="validator-hint">
      {m.errors_requiredField({ field: m.org_storesTransfer_destination() })}
    </span>
  </LabeledFormInput>
  {#key $form.source}
    {@const locale = getLocale()}
    {@const products = stores.find((s) => s.Id === $form.source)?.Products}
    <MultiselectBox header={m.org_storesTransfer_products()}>
      {#if products}
        {#each products
          .toSorted((a, b) => byName(a.ProductDefinition, b.ProductDefinition, locale))
          .toSorted((a, b) => byName(a.Project, b.Project, locale)) as product}
          <label class="flex flex-row py-2 text-left cursor-pointer">
            <input
              type="checkbox"
              class="checkbox checkbox-info mr-2"
              bind:group={$form.products}
              value={product.Id}
            />
            {product.Project.Name}:
            <IconContainer
              icon={getProductIcon(product.ProductDefinition.Workflow.ProductType)}
              width="24"
            />
            {product.ProductDefinition.Name}
          </label>
        {/each}
      {:else}
        {m.org_noproducts()}
      {/if}
    </MultiselectBox>
  {/key}
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton
      disabled={!(
        $form.source &&
        $form.destination &&
        $form.source !== $form.destination &&
        $form.products.length
      )}
      icon={Icons.Transfer}
    />
  </div>
</form>
