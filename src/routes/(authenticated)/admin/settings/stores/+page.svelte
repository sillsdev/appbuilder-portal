<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import StoreListDisplay from '$lib/organizations/components/StoreListDisplay.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
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
    <StoreListDisplay
      editable
      editLink={localizeHref(`${base}/edit?id=${store.Id}`)}
      {store}
      getTitle={(store) => store.BuildEnginePublisherId}
      showDescription
    />
  {/each}
</div>
