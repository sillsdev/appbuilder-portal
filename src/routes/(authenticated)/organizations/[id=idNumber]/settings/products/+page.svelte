<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<h2>{m.org_productsTitle()}</h2>
<div class="m-4 mt-2">
  <form
    class="mb-2"
    action="?/togglePublic"
    method="post"
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
    <Toggle
      title={{ key: 'org_makePrivateTitle', class: 'font-bold' }}
      message={{ key: 'org_makePrivateDescription' }}
      class="pb-2"
      name="publicByDefault"
      checked={!!data.organization.PublicByDefault}
      inputAttr={{
        onchange: (e) => e.currentTarget.form?.requestSubmit()
      }}
      onIcon="mdi:eye"
      offIcon="mdi:eye-off-outline"
    />
  </form>
  <MultiselectBox header={m.org_productSelectTitle()}>
    {#each data.allProductDefs.toSorted((a, b) => byName(a, b, getLocale())) as productDef}
      <form
        method="POST"
        action="?/toggleProduct"
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
        <input type="hidden" name="prodDefId" value={productDef.Id} />
        <MultiselectBoxElement
          title={productDef.Name ?? ''}
          description={productDef?.Description ?? ''}
          checked={productDef.enabled}
          checkProps={{
            name: 'enabled',
            onchange: (e) => e.currentTarget.form?.requestSubmit()
          }}
        />
      </form>
    {/each}
  </MultiselectBox>
</div>
