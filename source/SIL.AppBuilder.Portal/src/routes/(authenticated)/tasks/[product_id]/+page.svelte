<script lang="ts">
  import type { PageData } from './$types';
  import Waiting from "./instructions/Waiting.svelte";

  export let data: PageData;
</script>

<div class="p-5">
  <form>
    {#if data.actions?.length > 0}
    <div class="flex flex-row gap-x-3">
      {#each data.actions as action}
      <input type="submit" class="btn" value={action}>
      {/each}
    </div>
    {/if}
    <label class="form-control">
      <div class="label">
        <span class="label-text">Comment</span>
      </div>
      <textarea class="textarea textarea-bordered h-24"></textarea>
    </label>
  </form>
  <hr class="border-t-4 my-2">
  <h2>
    {data.taskTitle}
  </h2>
  <div>
    {#if data.fields.user && data.fields.email}
    <div class="flex flex-col gap-x-3 w-full md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">User Name</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.user} />
      </label>
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Email</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.email} />
      </label>
    </div>
    {/if}
    <div class="flex flex-col gap-x-3 w-full md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Name</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.name} />
      </label>
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Project Description</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.description} />
      </label>
    </div>
    {#if data.fields.store}
    <div class="flex flex-col gap-x-3 md:flex-row">
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Store</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.store} />
      </label>
      {#if data.fields.listingLanguage}
      <label class="form-control w-full md:w-2/4">
        <div class="label">
          <span class="label-text">Store Listing Language</span>
        </div>
        <input type="text" class="input input-bordered w-full" readonly value={data.fields.listingLanguage} />
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
    {#if data.fields.product && data.fields.appType && data.fields.langCode}
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Product</span>
      </div>
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.product} />
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
      <input type="text" class="input input-bordered w-full" readonly value={data.fields.langCode} />
    </label>
    {/if}
  </div>
  {#if data.instructions}
  <div class="py-2">
    <Waiting />
  </div>
  {/if}
  {#if data.files?.length > 0}
  <div class="overflow-x-auto max-h-96">
    <h3>Files</h3>
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>BuildId</th>
          <th>Type</th>
          <th>Size</th>
          <th>Link</th>
          <th>FileId</th>
        </tr>
      </thead>
      <tbody>
        {#each data.files as file}
        <tr>
          <td>{file.buildId}</td>
          <td>{file.type}</td>
          <td>{file.size}</td>
          <td>{file.url}</td>
          <td>{file.id}</td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {/if}
  {#if data.reviewers?.length > 0}
  <div class="overflow-x-auto max-h-96">
    <h3>Reviewers</h3>
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {#each data.reviewers as reviewer}
        <tr>
          <td>{reviewer.id}</td>
          <td>{reviewer.name}</td>
          <td>{reviewer.email}</td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {/if}
</div>

<style>
  .label-text {
    font-weight: bold;
  }
</style>