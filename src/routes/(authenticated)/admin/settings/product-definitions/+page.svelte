<script lang="ts">
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';
</script>

<h2>{m.prodDefs_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  <IconContainer icon={Icons.AddProduct} width={20} />
  {m.prodDefs_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as pD}
    <DataDisplayBox
      editable
      editLink={localizeHref(`${base}/edit?id=${pD.Id}`)}
      fields={[
        {
          key: 'prodDefs_type',
          value: pD.AllowAllApplicationTypes
            ? m.prodDefs_type_allowAll()
            : pD.ApplicationTypes.map((at) => at.Description)
                .sort((a, b) => byString(a, b, getLocale()))
                .join(', ')
        },
        {
          key: 'prodDefs_flow',
          value: pD.Workflow.Name
        },
        {
          key: 'prodDefs_rebuildFlow',
          value: pD.RebuildWorkflow?.Name
        },
        {
          key: 'prodDefs_republishFlow',
          value: pD.RepublishWorkflow?.Name
        },
        {
          key: 'common_description',
          value: pD.Description
        }
      ]}
    >
      {#snippet title()}
        <h3>
          <IconContainer
            icon={getProductIcon(pD.Workflow.ProductType)}
            width={24}
            class="mr-1"
          />{pD.Name}
        </h3>
      {/snippet}
    </DataDisplayBox>
  {/each}
</div>
