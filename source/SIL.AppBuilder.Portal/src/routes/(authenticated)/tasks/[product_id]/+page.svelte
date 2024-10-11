<script lang="ts">
  import type { PageData } from './$types';
  import { instructions } from './instructions';
  import { superForm } from 'sveltekit-superforms';
  import { writable } from 'svelte/store';
  import { createTable, Subscribe, Render } from 'svelte-headless-table';
  import { addSortBy } from 'svelte-headless-table/plugins';
  import SortDirectionPicker from '$lib/components/SortDirectionPicker.svelte';
  import * as m from '$lib/paraglide/messages';

  export let data: PageData;

  const { form, enhance, submit } = superForm(data.taskForm, {
    onChange: ({ paths }) => {
      if (paths.includes('flowAction')) {
        submit();
      }
    }
  });

  const fileData = writable(data.files);

  const fileTable = createTable(fileData, {
    sort: addSortBy()
  });
  // TODO: i18n
  const fileColumns = fileTable.createColumns([
    fileTable.column({
      header: 'Build Id',
      accessor: (f) => f.ProductBuildId
    }),
    fileTable.column({
      header: 'Content Type',
      accessor: (f) => f.ContentType
    }),
    fileTable.column({
      header: 'File Size',
      accessor: (f) => f.FileSize
    }),
    fileTable.column({
      header: 'Url',
      accessor: (f) => f.Url
    })
  ]);

  const {
    headerRows: fileHeaderRows,
    rows: fileRows,
    tableAttrs: fileTableAttrs,
    tableBodyAttrs: fileTableBodyAttrs
  } = fileTable.createViewModel(fileColumns);

  const reviewerData = writable(data.reviewers);
  const reviewerTable = createTable(reviewerData);

  const reviewerColumns = reviewerTable.createColumns([
    reviewerTable.column({
      header: 'Id',
      accessor: (r) => r.Id
    }),
    reviewerTable.column({
      header: m.common_name(),
      accessor: (r) => r.Name
    }),
    reviewerTable.column({
      header: m.profile_email(),
      accessor: (r) => r.Email
    })
  ]);

  const {
    headerRows: reviewerHeaderRows,
    rows: reviewerRows,
    tableAttrs: reviewerTableAttrs,
    tableBodyAttrs: reviewerTableBodyAttrs
  } = reviewerTable.createViewModel(reviewerColumns);
</script>

<div class="p-5">
  <form method="POST" use:enhance>
    {#if data.actions?.length}
      <div class="flex flex-row gap-x-3">
        {#each data.actions as action}
          <label class="btn">
            {action}
            <input
              type="radio"
              name="flowAction"
              bind:group={$form.flowAction}
              class="hidden"
              value={action}
            />
          </label>
        {/each}
      </div>
    {/if}
    <label class="form-control">
      <div class="label">
        <span class="label-text">{m.project_products_transitions_comment()}</span>
      </div>
      <textarea class="textarea textarea-bordered h-24" name="comment" bind:value={$form.comment} />
    </label>
    <input type="hidden" name="state" bind:value={$form.state} />
  </form>
  <hr class="border-t-4 my-2" />
  <h2>
    {data.taskTitle}
  </h2>
  <div>
    {#if data.fields.ownerName && data.fields.ownerEmail}
      <div class="flex flex-col gap-x-3 w-full md:flex-row">
        <label class="form-control w-full md:w-2/4">
          <div class="label">
            <span class="label-text">User Name</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full"
            readonly
            value={data.fields.ownerName}
          />
        </label>
        <label class="form-control w-full md:w-2/4">
          <div class="label">
            <span class="label-text">Email</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full"
            readonly
            value={data.fields.ownerEmail}
          />
        </label>
      </div>
    {/if}
    <div class="flex flex-col gap-x-3 w-full md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Name</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.projectName}
        />
      </label>
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Description</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.projectDescription}
        />
      </label>
    </div>
    {#if data.fields.storeDescription}
      <div class="flex flex-col gap-x-3 md:flex-row">
        <label class="form-control w-full md:w-2/4">
          <div class="label">
            <span class="label-text">Store</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full"
            readonly
            value={data.fields.storeDescription}
          />
        </label>
        {#if data.fields.listingLanguageCode}
          <label class="form-control w-full md:w-2/4">
            <div class="label">
              <span class="label-text">Store Listing Language</span>
            </div>
            <input
              type="text"
              class="input input-bordered w-full"
              readonly
              value={data.fields.listingLanguageCode}
            />
          </label>
        {/if}
      </div>
    {/if}
    {#if data.fields.projectURL}
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">App Project URL</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.projectURL}
        />
      </label>
    {/if}
    {#if data.fields.productDescription && data.fields.appType && data.fields.projectLanguageCode}
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">Product</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.productDescription}
        />
      </label>
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">Application Type</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.appType}
        />
      </label>
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">Language Code</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.fields.projectLanguageCode}
        />
      </label>
    {/if}
  </div>
  {#if data.instructions}
    <div class="py-2" id="instructions">
      <svelte:component this={instructions[data.instructions]} />
    </div>
  {/if}
  {#if data?.files?.length}
    <div class="overflow-x-auto">
      <h3>{m.products_files_title()}</h3>
      <table class="w-full table" {...$fileTableAttrs}>
        <thead>
          {#each $fileHeaderRows as headerRow (headerRow.id)}
            <Subscribe fileRowAttrs={headerRow.attrs()} let:fileRowAttrs>
              <tr class="border-b-2 text-left" {...fileRowAttrs}>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe 
                    attrs={cell.attrs()} let:attrs
                    props={cell.props()} let:props  
                  >
                    <th {...attrs} on:click={props.sort.toggle}>
                      <SortDirectionPicker order={props.sort.order}>
                        <Render of={cell.render()} />
                      </SortDirectionPicker>
                    </th>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </thead>
        <tbody {...$fileTableBodyAttrs}>
          {#each $fileRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <tr {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <td {...attrs}>
                      <Render of={cell.render()} />
                    </td>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  {#if data?.reviewers?.length}
    <div class="overflow-x-auto">
      <h3>{m.project_side_reviewers_title()}</h3>
      <table class="w-full table" {...$reviewerTableAttrs}>
        <thead>
          {#each $reviewerHeaderRows as headerRow (headerRow.id)}
            <Subscribe reviewerRowAttrs={headerRow.attrs()} let:reviewerRowAttrs>
              <tr class="border-b-2 text-left" {...reviewerRowAttrs}>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe 
                    attrs={cell.attrs()} let:attrs
                    props={cell.props()} let:props
                  >
                    <th {...attrs} on:click={props.sort.toggle}>
                      <SortDirectionPicker order={props.sort.order}>
                        <Render of={cell.render()} />
                      </SortDirectionPicker>
                    </th>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </thead>
        <tbody {...$reviewerTableBodyAttrs}>
          {#each $reviewerRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <tr {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <td {...attrs}>
                      <Render of={cell.render()} />
                    </td>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style lang="postcss">
  .label-text {
    font-weight: bold;
  }
  /*this VVV technique allows css rules to break svelte scoping downwards*/
  #instructions :global(ul) {
    @apply pl-10 list-disc;
  }
  #instructions :global(ol) {
    @apply pl-10 list-decimal;
  }
  #instructions :global(h3) {
    @apply text-info;
  }
  #instructions :global(a) {
    @apply link;
  }
  th {
    @apply cursor-pointer select-none;
  }
  /* this helps prevent the vertical jankiness */
  thead {
    line-height: inherit;
  }
</style>
