<script lang="ts">
  export let size: number;
  export let total: number;
  export let page: number = 0;

  $: pageCount = Math.ceil(total / size);
  $: collapse = pageCount > 6;
  $: hasPreviousPage = page > 0;
  $: hasNextPage = page < pageCount - 1;

  function index(i: number, page: number): number {
    if (page <= 3) return i + 2;
    else if (page > pageCount - 5) return pageCount + i - 5;
    else return page + i - 1;
  }
</script>

<div class="flex flex-row flex-wrap gap-1 w-full max-w-xs md:w-auto md:max-w-none">
  {#if pageCount > 1}
    <div class="join max-w-xs overflow-x-auto md:max-w-none">
      <label class="join-item btn btn-square form-control {hasPreviousPage ? '' : 'btn-disabled'}">
        <span>«</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={page - 1} />
      </label>
      <label class="join-item btn btn-square form-control {page === 0 ? 'bg-primary' : ''}">
        <span>{1}</span>
        <input class="hidden" type="radio" bind:group={page} name="page" value={0} />
      </label>
      {#if collapse}
        {#if page > 3}
          <button class="join-item btn btn-disabled">...</button>
        {:else}
          <label class="join-item btn btn-square form-control {page === 1 ? 'bg-primary' : ''}">
            <span>{2}</span>
            <input class="hidden" type="radio" bind:group={page} name="page" value={1} />
          </label>
        {/if}
        {#each Array.from({ length: 3 }) as _, i}
          <label
            class="join-item btn btn-square form-control {page === index(i, page)
              ? 'bg-primary'
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
              ? 'bg-primary'
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
          <label class="join-item btn btn-square form-control {page === i + 1 ? 'bg-primary' : ''}">
            <span>{i + 2}</span>
            <input class="hidden" type="radio" bind:group={page} name="page" value={i + 1} />
          </label>
        {/each}
      {/if}
      <label
        class="join-item btn btn-square form-control {page === pageCount - 1 ? 'bg-primary' : ''}"
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
  <span class="input input-bordered flex items-center gap-2 max-w-xs">
    Show: <!-- TODO: i18n -->
    <input type="number" name="size" bind:value={size} />
    / {total}
  </span>
</div>
