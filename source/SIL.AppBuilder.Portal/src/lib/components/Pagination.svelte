<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  interface Props {
    size: number;
    total: number;
    page?: number;
    extraSizeOptions?: number[];
  }

  let { size = $bindable(), total, page = $bindable(0), extraSizeOptions = [] }: Props = $props();

  let pageCount = $derived(Math.ceil(total / size));
  let collapse = $derived(pageCount > 6);
  let hasPreviousPage = $derived(page > 0);
  let hasNextPage = $derived(page < pageCount - 1);

  function index(i: number, page: number): number {
    if (page <= 3) return i + 2;
    else if (page > pageCount - 5) return pageCount + i - 5;
    else return page + i - 1;
  }
</script>

{#snippet button(index: number)}
  <label class="join-item btn btn-square form-control" class:bg-neutral={page === index}>
    <span>{index + 1}</span>
    <input class="hidden" type="radio" bind:group={page} name="page" value={index} />
  </label>
{/snippet}

<div class="flex flex-row flex-wrap gap-1 w-full">
  {#if pageCount > 1}
    <div class="join max-w-xs overflow-x-auto md:max-w-none">
      <label class="join-item btn btn-square form-control" class:btn-disabled={!hasPreviousPage}>
        <span>«</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={page - 1} />
      </label>
      {@render button(0)}
      {#if collapse}
        {#if page > 3}
          <button class="join-item btn btn-disabled">...</button>
        {:else}
          {@render button(1)}
        {/if}
        {#each Array.from({ length: 3 }) as _, i}
          {@render button(index(i, page))}
        {/each}
        {#if page < pageCount - 4}
          <button class="join-item btn btn-disabled">...</button>
        {:else}
          {@render button(pageCount - 2)}
        {/if}
      {:else}
        {#each Array.from({ length: pageCount - 2 }) as _, i}
          {@render button(i + 1)}
        {/each}
      {/if}
      {@render button(pageCount - 1)}
      <label class="join-item btn btn-square form-control" class:btn-disabled={!hasNextPage}>
        <span>»</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={page + 1} />
      </label>
    </div>
  {/if}
  <div class="flex flex-row grow">
    <div class="input flex items-center w-fit">
      {m.common_total({ total })}
    </div>
    <div class="grow">&nbsp;</div>
    <select class="select select-bordered" name="size" bind:value={size}>
      {#each [10, 25, 50, 100].concat(extraSizeOptions).sort((a, b) => a - b) as value}
        <option {value}>{value}</option>
      {/each}
    </select>
  </div>
</div>
