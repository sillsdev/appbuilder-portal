<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import Dropdown, { type DropdownClasses } from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getAppIcon } from '$lib/icons';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    class?: DropdownClasses;
    types: Prisma.ApplicationTypesGetPayload<{
      select: {
        Id: true;
        Description: true;
      };
    }>[];
    value: number | null;
    extra?: Snippet;
    attr?: HTMLSelectAttributes;
  }

  let { class: classes = {}, types, value = $bindable(), extra, attr = {} }: Props = $props();

  const current = $derived(types.find((type) => type.Id === value));

  let open = $state(false);

  function onclick(val: number) {
    open = false;
    value = val;
  }
</script>

<Dropdown
  class={{
    dropdown: ['w-full', classes.dropdown],
    label: ['w-full input cursor-auto', classes.label],
    content: ['overflow-y-auto w-auto', classes.content]
  }}
  bind:open
>
  {#snippet label()}
    <div class="flex flex-row items-center gap-1 w-full">
      {#if current}
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src={getAppIcon(current.Id)} width={24} />
        <span class="grow text-left">
          {current.Description}
        </span>
      {:else}
        <span class="grow">&nbsp;</span>
      {/if}
      <IconContainer icon="gridicons:dropdown" width={20} />
    </div>
  {/snippet}
  {#snippet content()}
    <ul class="menu menu-sm gap-1 p-2">
      {#if attr.name}
        <input type="hidden" name={attr.name} {value} />
      {/if}
      {@render extra?.()}
      {#each types.toSorted((a, b) => byString(a.Description, b.Description, getLocale())) as type}
        <li class="w-full">
          <div
            class={[
              'btn flex-nowrap justify-start pl-2 pr-1',
              type.Id === value ? 'btn-secondary' : 'btn-ghost'
            ]}
            onclick={() => onclick(type.Id)}
            onkeypress={() => onclick(type.Id)}
            role="button"
            tabindex="0"
          >
            <!-- svelte-ignore a11y_missing_attribute -->
            <img src={getAppIcon(type.Id)} width={24} />
            <span class="grow text-left">
              {type.Description}
            </span>
          </div>
        </li>
      {/each}
    </ul>
  {/snippet}
</Dropdown>
