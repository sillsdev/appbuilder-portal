<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ClassValue } from 'svelte/elements';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getProductIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

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

  const current = $derived(productDefinitions.find((pD) => pD.Id === value));
</script>

<label class={['select gap-4', classes]}>
  <IconContainer icon={current ? getProductIcon(current!.Workflow.ProductType) : ''} width={20} />
  <select bind:value name="productDefinitionId" class="ps-0!">
    <option value={null} selected>{m.filters_allProdDefs()}</option>
    {#each productDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as pD}
      <option value={pD.Id}>
        <IconContainer icon={getProductIcon(pD.Workflow.ProductType)} width={20} />
        {pD.Name}
      </option>
    {/each}
  </select>
</label>
