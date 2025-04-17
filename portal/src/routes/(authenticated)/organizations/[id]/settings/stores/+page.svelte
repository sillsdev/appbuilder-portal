<script lang="ts">
  import { enhance } from '$app/forms';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import type { ActionData, PageData } from './$types';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<h2>{m.org_storesTitle()}</h2>
<div class="m-4">
  <MultiselectBox header={m.org_storeSelectTitle()}>
    {#each data.stores.toSorted((a, b) => byName(a, b, getLocale())) as store}
      <form
        id="store-{store.Id}"
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
        <input type="hidden" name="orgId" value={data.organization.Id} />
        <input type="hidden" name="storeId" value={store.Id} />
        <MultiselectBoxElement
          title={store.Name ?? ''}
          description={store?.Description ?? ''}
          bind:checked={store.enabled}
          checkProps={{
            name: 'enabled',
            onchange: () => (document.getElementById(`store-${store.Id}`) as HTMLFormElement).requestSubmit()
          }}
        />
      </form>
    {/each}
  </MultiselectBox>
</div>
