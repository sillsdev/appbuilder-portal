<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  export let data: PageData;

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
  <div class="border border-opacity-15 border-gray-50 rounded-lg p-2">
    <div>
      <span>{m.org_storeSelectTitle()}</span>
    </div>
    {#each $superFormData.stores as store}
      <div class="my-2">
        <label>
          <input type="checkbox" bind:checked={store.enabled} />
          <b>
            {data.allStores.find((p) => p.Id === store.storeId)?.Name}
          </b>
          <br />
          {data.allStores.find((p) => p.Id === store.storeId)?.Description}
        </label>
      </div>
    {/each}
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/organizations">Cancel</a>
  </div>
</form>
