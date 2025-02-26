<script lang="ts">
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { sortByNullableString } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const {
    form: superFormData,
    enhance,
    allErrors
  } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });

  const allStores = new Map(data.allStores);
</script>

<h2>{m.org_storesTitle()}</h2>
<form action="" class="m-4" method="post" use:enhance>
  <MultiselectBox header={m.org_storeSelectTitle()}>
    <div>
      {#each $superFormData.stores.sort( (a, b) => sortByNullableString(allStores.get(a.storeId)?.Name, allStores.get(b.storeId)?.Name, languageTag())) as store}
        {@const storeLook = allStores.get(store.storeId)}
        <MultiselectBoxElement
          title={storeLook?.Name ?? ''}
          description={storeLook?.Description ?? ''}
          bind:checked={store.enabled}
        />
      {/each}
    </div>
  </MultiselectBox>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
