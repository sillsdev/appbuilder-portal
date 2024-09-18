<script lang="ts">
  import type { PageData } from './$types';
  import { instructions } from './instructions';
  import SortTable from "./components/SortTable.svelte";

  export let data: PageData;
</script>

<div class="p-5">
  <form method="POST">
    {#if data.actions?.length}
    <div class="flex flex-row gap-x-3">
      {#each data.actions as action}
      <input type="submit" name="action" class="btn" value={action[0]}>
      {/each}
    </div>
    {/if}
    <label class="form-control">
      <div class="label">
        <span class="label-text">Comment</span>
      </div>
      <textarea class="textarea textarea-bordered h-24" name="comment"></textarea>
    </label>
    <input type="hidden" name="state" value={data.taskTitle}>
  </form>
  <hr class="border-t-4 my-2">
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
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.ownerName} />
      </label>
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Email</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.ownerEmail} />
      </label>
    </div>
    {/if}
    <div class="flex flex-col gap-x-3 w-full md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Name</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.projectName} />
      </label>
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Description</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.projectDescription} />
      </label>
    </div>
    {#if data.fields.storeDescription}
    <div class="flex flex-col gap-x-3 md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Store</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.storeDescription} />
      </label>
      {#if data.fields.listingLanguageCode}
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Store Listing Language</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.listingLanguageCode} />
      </label>
      {/if}
    </div>
    {/if}
    {#if data.fields.projectURL}
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">App Project URL</span>
      </div>
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.projectURL} />
    </label>
    {/if}
    {#if data.fields.productDescription && data.fields.appType && data.fields.projectLanguageCode}
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Product</span>
      </div>
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.productDescription} />
    </label>
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Application Type</span>
      </div>
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.appType} />
    </label>
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Language Code</span>
      </div>
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.projectLanguageCode} />
    </label>
    {/if}
  </div>
  {#if data.instructions}
  <div class="py-2" id="instructions">
    <svelte:component this={instructions[data.instructions]} />
  </div>
  {/if}
  {#if data?.files?.length}
  <div class="overflow-x-auto max-h-96">
    <h3>Files</h3>
    <SortTable items={data.files} />
  </div>
  {/if}
  {#if data?.reviewers?.length}
  <div class="overflow-x-auto max-h-96">
    <h3>Reviewers</h3>
    <SortTable items={data.reviewers} />
  </div>
  {/if}
</div>

<style lang=postcss>
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
</style>