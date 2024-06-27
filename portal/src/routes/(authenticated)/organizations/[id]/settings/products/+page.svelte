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

<h2>{m.org_productsTitle()}</h2>
<form action="" class="m-4" method="post" use:enhance>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {m.admin_settings_organizations_publicByDefault()}
          </span>
          <span class="text-sm">
            {m.admin_settings_organizations_publicByDefaultDescription()}
          </span>
        </div>
        <input
          name="publicByDefault"
          class="toggle toggle-info"
          type="checkbox"
          bind:checked={$superFormData.publicByDefault}
        />
      </div>
    </label>
  </div>
  <div class="border border-opacity-15 border-gray-50 rounded-lg p-2">
    <div>
      <span>{m.org_productSelectTitle()}</span>
    </div>
    {#each $superFormData.products as productDef}
      <div class="my-2">
        <label>
          <input type="checkbox" bind:checked={productDef.enabled} />
          <b>
            {data.allProductDefs.find((p) => p.Id === productDef.productId)?.Name}
          </b>
          <br />
          {data.allProductDefs.find((p) => p.Id === productDef.productId)?.Description}
        </label>
      </div>
    {/each}
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/organizations">Cancel</a>
  </div>
</form>
