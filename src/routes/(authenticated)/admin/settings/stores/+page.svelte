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

  const base = '/admin/settings/stores';
</script>

<h2>{m.admin_nav_stores()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.models_add({ name: m.stores_name() })}
</a>

<div class="flex flex-col w-full">
  {#each data.stores.toSorted((a, b) => byName(a, b, getLocale())) as store}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${store.Id}`))}
      title={store.Name}
      fields={[
        { key: 'stores_attributes_description', value: store.Description },
        { key: 'storeTypes_name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>
