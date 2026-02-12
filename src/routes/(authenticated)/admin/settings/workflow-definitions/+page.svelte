<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { getProductIcon, getStoreIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/workflow-definitions';
</script>

{#snippet storeType(wd?: (typeof data)['workflowDefinitions'][number])}
  {#if wd?.StoreType}
    <IconContainer icon={getStoreIcon(wd.StoreType.Id)} width={16} class="mr-1" />{wd.StoreType
      .Description}
  {/if}
{/snippet}

<h2>{m.flowDefs_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.flowDefs_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.workflowDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as wd}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${wd.Id}`))}
      fields={[
        {
          key: 'common_description',
          value: wd.Description
        },
        {
          key: 'flowDefs_storeType',
          snippet: storeType
        },
        {
          key: 'flowDefs_productType',
          value: m.flowDefs_productTypes({ type: wd.ProductType })
        },
        {
          key: 'flowDefs_type',
          value: m.flowDefs_types({ type: wd.Type })
        }
        // ISSUE: #1102 Do we want to show WorkflowOptions here?
      ]}
      data={wd}
    >
      {#snippet title()}
        <h3>
          <IconContainer icon={getProductIcon(wd.ProductType)} width={24} class="mr-1" />{wd.Name}
        </h3>
      {/snippet}
    </DataDisplayBox>
  {/each}
</div>
