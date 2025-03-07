<script lang="ts">
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import * as m from '$lib/paraglide/messages';
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
</script>

<h2>{m.org_storesTitle()}</h2>
<form action="" class="m-4" method="post" use:enhance>
  <MultiselectBox header={m.org_storeSelectTitle()}>
    <div>
      {#each $superFormData.stores as store}
        <MultiselectBoxElement
          title={data.allStores.find((p) => p.Id === store.storeId)?.Name ?? ''}
          description={data.allStores.find((p) => p.Id === store.storeId)?.Description ?? ''}
          bind:checked={store.enabled}
        />
      {/each}
    </div>
  </MultiselectBox>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
