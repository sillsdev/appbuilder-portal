<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import StoreListDisplay from '$lib/organizations/components/StoreListDisplay.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = $derived(`/organizations/${data.organization.Id}/settings/stores`);
</script>

<div class="flex flex-row items-center">
  <h2>{m.org_storesTitle()}</h2>
  <BlockIfJobsUnavailable class="btn btn-outline">
    {#snippet altContent()}
      <IconContainer icon="bx:transfer" width="20" />
      <span>{m.org_storesTransfer()}</span>
    {/snippet}
    <a href={localizeHref(`${base}/transfer`)} class="btn btn-outline">
      {@render altContent()}
    </a>
  </BlockIfJobsUnavailable>
</div>
<p class="p-4 pt-0">{m.org_storeSelectTitle()}</p>
<div class="flex flex-col w-full">
  {#each data.stores.toSorted( (a, b) => byString(a.Description || a.BuildEnginePublisherId, b.Description || b.BuildEnginePublisherId, getLocale()) ) as store}
    <StoreListDisplay
      editable={store.OwnerId === data.organization.Id}
      editLink={localizeHref(`${base}/edit?id=${store.Id}`)}
      {store}
      getTitle={(store) => store.Description ?? ''}
    >
      {#snippet extra(store)}
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
          <InputWithMessage title={{ key: 'flowDefs_enabled' }}>
            <input
              name="enabled"
              class="toggle toggle-accent"
              type="checkbox"
              checked={store.enabled}
              onchange={(e) => e.currentTarget.form?.requestSubmit()}
            />
          </InputWithMessage>
        </form>
      {/snippet}
    </StoreListDisplay>
  {/each}
</div>
