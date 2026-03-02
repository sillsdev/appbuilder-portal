<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ClassValue } from 'svelte/elements';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import { getProductIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    class?: ClassValue;
    productDefinitions: Prisma.ProductDefinitionsGetPayload<{
      select: {
        Id: true;
        Name: true;
        Workflow: {
          select: {
            ProductType: true;
          };
        };
      };
    }>[];
    value: number | null;
  }

  let { class: classes, productDefinitions, value = $bindable() }: Props = $props();
</script>

<SelectWithIcon
  class={classes}
  attr={{ name: 'productDefinitionId' }}
  bind:value
  items={productDefinitions.map((pd) => ({ ...pd, icon: getProductIcon(pd.Workflow.ProductType) }))}
>
  {#snippet extra()}
    <option value={null} selected>{m.filters_allProdDefs()}</option>
  {/snippet}
</SelectWithIcon>
