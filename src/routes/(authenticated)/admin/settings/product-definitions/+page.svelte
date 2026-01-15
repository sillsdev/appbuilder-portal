<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/product-definitions';
</script>

<h2>{m.prodDefs_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.prodDefs_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as pD}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${pD.Id}`))}
      title={pD.Name}
      fields={[
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
          key: 'prodDefs_description',
          value: pD.Description
        }
      ]}
    />
  {/each}
</div>
