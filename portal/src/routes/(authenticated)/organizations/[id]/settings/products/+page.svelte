<script lang="ts">
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
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
  <MultiselectBox header={m.org_productSelectTitle()}>
    {#each $superFormData.products as productDef}
      <MultiselectBoxElement
        title={data.allProductDefs.find((p) => p.Id === productDef.productId)?.Name ?? ''}
        description={data.allProductDefs.find((p) => p.Id === productDef.productId)?.Description ??
          ''}
        bind:checked={productDef.enabled}
      />
    {/each}
  </MultiselectBox>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
