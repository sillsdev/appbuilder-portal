<script lang="ts">
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import { m } from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });

  const allStores = new Map(data.allStores);
</script>

<h2>{m.org_storesTitle()}</h2>
<form action="" class="m-4" method="post" use:enhance>
  <!-- TODO: sort this. I think this will need a refactor of MultiselectBox -->
  <MultiselectBox header={m.org_storeSelectTitle()}>
    <div>
      {#each $form.stores as store}
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
