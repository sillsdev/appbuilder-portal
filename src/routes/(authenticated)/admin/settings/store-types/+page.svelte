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

  const base = '/admin/settings/store-types';
</script>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.storeTypes_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.storeTypes.toSorted((a, b) => byName(a, b, getLocale())) as storeType}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${storeType.Id}`))}
      title={storeType.Name}
      fields={[{ key: 'stores_attributes_description', value: storeType.Description }]}
    />
  {/each}
</div>
