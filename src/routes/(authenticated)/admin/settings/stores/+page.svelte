<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { displayStoreGPTitle } from '$lib/prisma';
  import { byString } from '$lib/utils/sorting';

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
  {#each data.stores.toSorted( (a, b) => byString(a.BuildEnginePublisherId, b.BuildEnginePublisherId, getLocale()) ) as store}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${store.Id}`))}
      title={store.BuildEnginePublisherId}
      fields={[
        { key: 'stores_attributes_description', value: store.Description },
        { key: 'project_type', value: store.StoreType.Description },
        ...(displayStoreGPTitle(store)
          ? [{ key: 'stores_gpTitle' as ValidI13nKey, value: store.GooglePlayTitle }]
          : [])
      ]}
    />
  {/each}
</div>
