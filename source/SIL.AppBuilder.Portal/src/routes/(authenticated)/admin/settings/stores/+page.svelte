<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<a href="stores/new" class="btn btn-outline m-4 mt-0">
  {m.models_add({ name: m.stores_name() })}
</a>

<div class="flex flex-col w-full">
  {#each data.stores.toSorted((a, b) => byName(a, b, getLocale())) as store}
    <DataDisplayBox
      editable
      onEdit={() => goto('/admin/settings/stores/edit?id=' + store.Id)}
      title={store.Name}
      fields={[
        { key: 'stores_attributes_description', value: store.Description },
        { key: 'storeTypes_name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>
