<script lang="ts">
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons, getAppIcon, getProductIcon } from '$lib/icons';
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

{#snippet appType(pD?: (typeof data)['productDefinitions'][number])}
  {#if pD}
    {#if pD.AllowAllApplicationTypes}
      {m.prodDefs_type_allowAll()}
    {:else}
      {@const locale = getLocale()}
      <div class="flex flex-row flex-wrap gap-2 indent-0">
        {#each pD.ApplicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, locale) ) as at}
          <span class="flex flex-row gap-1">
            <img src={getAppIcon(at.Id)} width={24} alt="" />
            {at.Description}
          </span>
        {/each}
      </div>
    {/if}
  {/if}
{/snippet}

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
          snippet: appType
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
