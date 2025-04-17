<script lang="ts">
  import { enhance } from '$app/forms';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
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

  function trySubmit(id: string) {
    (document.getElementById(id) as HTMLFormElement).requestSubmit();
  }
</script>

<h2>{m.org_productsTitle()}</h2>
<div class="m-4 mt-2">
  <form
    id="togglePublic"
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
    <input type="hidden" name="orgId" value={data.organization.Id} />
    <InputWithMessage
      title={{ key: 'org_makePrivateTitle', classes: 'font-bold' }}
      message={{ key: 'org_makePrivateDescription' }}
      className="pb-2"
    >
      <input
        name="publicByDefault"
        class="toggle toggle-accent"
        type="checkbox"
        checked={data.organization.PublicByDefault}
        onchange={() => () => trySubmit('togglePublic')}
      />
    </InputWithMessage>
  </form>
  <MultiselectBox header={m.org_productSelectTitle()}>
    {#each data.allProductDefs.toSorted((a, b) => byName(a, b, getLocale())) as productDef}
      <form
        id="def-{productDef.Id}"
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
        <input type="hidden" name="orgId" value={data.organization.Id} />
        <input type="hidden" name="prodDefId" value={productDef.Id} />
        <MultiselectBoxElement
          title={productDef.Name ?? ''}
          description={productDef?.Description ?? ''}
          bind:checked={productDef.enabled}
          checkProps={{
            name: 'enabled',
            onchange: () => trySubmit(`def-${productDef.Id}`)
          }}
        />
      </form>
    {/each}
  </MultiselectBox>
</div>
