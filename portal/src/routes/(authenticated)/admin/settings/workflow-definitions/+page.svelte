<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/workflow-definitions';
</script>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.flowDefs_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.workflowDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as wd}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${wd.Id}`))}
      title={wd.Name}
      fields={[
        {
          key: 'flowDefs_description',
          value: wd.Description
        },
        {
          key: 'flowDefs_storeType',
          value: wd.StoreType?.Name
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
    />
  {/each}
</div>
