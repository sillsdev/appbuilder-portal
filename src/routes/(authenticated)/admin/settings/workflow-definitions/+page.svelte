<script lang="ts">
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/workflow-definitions';
</script>

<h2>{m.flowDefs_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  <IconContainer icon={Icons.AddGeneric} width={20} />
  {m.flowDefs_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.workflowDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as wd}
    <DataDisplayBox
      editable
      editLink={localizeHref(`${base}/edit?id=${wd.Id}`)}
      title={wd.Name}
      fields={[
        {
          key: 'common_description',
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
        },
        {
          key: 'flowDefs_options_title',
          snippet: options
        }
      ]}
      data={wd}
    />
  {/each}
</div>

{#snippet options(wd?: (typeof data)['workflowDefinitions'][number])}
  <span class="opacity-70 font-semibold">
    {#if wd?.WorkflowOptions.length}
      {#each wd.WorkflowOptions as option}
        <div>{m.flowDefs_options({ option })}</div>
      {/each}
    {:else}
      {m.common_none()}
    {/if}
  </span>
{/snippet}
