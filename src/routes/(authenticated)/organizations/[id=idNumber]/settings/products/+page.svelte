<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { Icons, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
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
      onIcon={Icons.Visible}
      offIcon={Icons.Invisible}
    />
  </form>
</div>
<p class="p-4 pt-0">{m.org_productSelectTitle()}</p>
<div class="flex flex-col w-full">
  {#each data.allProductDefs.toSorted((a, b) => byName(a, b, getLocale())) as pd}
    <DataDisplayBox fields={[{ key: 'common_description', value: pd.Description }]}>
      {#snippet title()}
        <h3>
          <IconContainer
            icon={getProductIcon(pd.Workflow.ProductType)}
            width={20}
            class="mr-1"
          />{pd.Name}
        </h3>
      {/snippet}
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
        <input type="hidden" name="prodDefId" value={pd.Id} />
        <InputWithMessage title={{ key: 'flowDefs_enabled' }}>
          <input
            name="enabled"
            class="toggle toggle-accent"
            type="checkbox"
            checked={pd.enabled}
            onchange={(e) => e.currentTarget.form?.requestSubmit()}
          />
        </InputWithMessage>
      </form>
      <div class="flex flex-row gap-1">
        <IconContainer icon={Icons.Product} width={20} tooltip={m.products_title()} />
        {pd._count.Products}
      </div>
    </DataDisplayBox>
  {/each}
</div>
