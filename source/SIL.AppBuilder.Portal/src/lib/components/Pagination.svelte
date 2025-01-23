<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  interface Props {
    size: number;
    total: number;
    page?: number;
    extraSizeOptions?: number[];
  }

  let {
    size = $bindable(),
    total,
    page = $bindable(0),
    extraSizeOptions = []
  }: Props = $props();

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

<div class="flex flex-row flex-wrap gap-1 w-full">
  {#if pageCount > 1}
    <div class="join max-w-xs overflow-x-auto md:max-w-none">
      <label class="join-item btn btn-square form-control {hasPreviousPage ? '' : 'btn-disabled'}">
        <span>«</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={page - 1} />
      </label>
      <label class="join-item btn btn-square form-control {page === 0 ? 'bg-neutral' : ''}">
        <span>{1}</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={0} />
      </label>
      {#if collapse}
        {#if page > 3}
          <button class="join-item btn btn-disabled">...</button>
        {:else}
          <label class="join-item btn btn-square form-control {page === 1 ? 'bg-neutral' : ''}">
            <span>{2}</span>
            <input class="hidden" type="radio" bind:group={page} name="page" value={1} />
          </label>
        {/if}
        {#each Array.from({ length: 3 }) as _, i}
          <label
            class="join-item btn btn-square form-control {page === index(i, page)
              ? 'bg-neutral'
              : ''}"
          >
            <span>{index(i, page) + 1}</span>
            <input
              class="hidden"
              type="radio"
              bind:group={page}
              name="page"
              value={index(i, page)}
            />
          </label>
        {/each}
        {#if page < pageCount - 4}
          <button class="join-item btn btn-disabled">...</button>
        {:else}
          <label
            class="join-item btn btn-square form-control {page === pageCount - 2
              ? 'bg-neutral'
              : ''}"
          >
            <span>{pageCount - 1}</span>
            <input
              class="hidden"
              type="radio"
              bind:group={page}
              name="page"
              value={pageCount - 2}
            />
          </label>
        {/if}
      {:else}
        {#each Array.from({ length: pageCount - 2 }) as _, i}
          <label class="join-item btn btn-square form-control {page === i + 1 ? 'bg-neutral' : ''}">
            <span>{i + 2}</span>
            <input class="hidden" type="radio" bind:group={page} name="page" value={i + 1} />
          </label>
        {/each}
      {/if}
      <label
        class="join-item btn btn-square form-control {page === pageCount - 1 ? 'bg-neutral' : ''}"
      >
        <span>{pageCount}</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={pageCount - 1} />
      </label>
      <label class="join-item btn btn-square form-control {hasNextPage ? '' : 'btn-disabled'}">
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
