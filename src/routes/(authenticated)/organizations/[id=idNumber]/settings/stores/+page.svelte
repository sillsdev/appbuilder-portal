<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { displayStoreGPTitle } from '$lib/prisma';
  import { toast } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<h2>{m.org_storesTitle()}</h2>
<div class="m-4">
  <MultiselectBox header={m.org_storeSelectTitle()}>
    {#each data.stores.toSorted( (a, b) => byString(displayStoreGPTitle(a) || a.BuildEnginePublisherId, displayStoreGPTitle(b) || b.BuildEnginePublisherId, getLocale()) ) as store}
      <form
        method="POST"
        action=""
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'success') {
              const data = result.data as ActionData;
              if (data?.ok) {
                toast('success', m.common_updated());
              }
            }
            return update({ reset: false });
          };
        }}
      >
        <input type="hidden" name="storeId" value={store.Id} />
        <MultiselectBoxElement
          title={displayStoreGPTitle(store) || store.BuildEnginePublisherId}
          description={store?.Description ?? ''}
          bind:checked={store.enabled}
          checkProps={{
            name: 'enabled',
            onchange: (e) => e.currentTarget.form?.requestSubmit()
          }}
        />
      </form>
    {/each}
  </MultiselectBox>
</div>
