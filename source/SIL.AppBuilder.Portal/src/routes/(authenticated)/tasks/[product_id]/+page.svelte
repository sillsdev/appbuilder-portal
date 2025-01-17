<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import SortTable from '$lib/components/SortTable.svelte';
  import * as m from '$lib/paraglide/messages';
  import { bytesToHumanSize } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { instructions } from './instructions';

  export let data: PageData;
  const { form, enhance, submit } = superForm(data.taskForm, {
    onChange: ({ paths }) => {
      if (paths.includes('flowAction')) {
        submit();
      }
    }
  });
  let urlCopied = false;
</script>

<div class="p-5">
  <div class="flex flex-row gap-x-3 p-2 flex-wrap">
    <div class="breadcrumbs">
      <ul>
        <li><a class="link" href="/tasks">{m.sidebar_myTasks_zero()}</a></li>
        <li><a class="link" href="/projects/{data.projectId}">{data.fields.projectName}</a></li>
        <li>{data.productDescription}</li>
      </ul>
    </div>
  </div>
  <form method="POST" use:enhance>
    {#if data.actions?.length}
      <div class="flex flex-row gap-x-3">
        {#each data.actions as action}
          <label class="btn btn-primary">
            {action}<!-- TODO: i18n (after MVP) -->
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
            <span class="label-text">{m.projectTable_columns_owner()}</span>
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
            <span class="label-text">{m.profile_email()}</span>
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
          <span class="label-text">{m.project_projectName()}</span>
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
          <span class="label-text">{m.project_projectDescription()}</span>
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
            <span class="label-text">{m.stores_name()}</span>
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
              <span class="label-text">{m.tasks_storeLanguage()}</span>
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
          <span class="label-text">{m.tasks_appProjectURL()}</span>
        </div>
        <span class="input input-bordered w-full flex flex-row gap-2 items-center">
          <input type="text" class="grow" readonly value={data.fields.projectURL} />
          <button
            class="cursor-copy"
            on:click={() => {
              if (data.fields.projectURL) {
                navigator.clipboard.writeText(data.fields.projectURL);
                urlCopied = true;
                setTimeout(() => {
                  urlCopied = false;
                }, 5000);
              }
            }}
          >
            {#if urlCopied}
              <IconContainer icon="mdi:check" width={24} class="text-success" />
            {:else}
              <IconContainer icon="mdi:content-copy" width={24} />
            {/if}
          </button>
        </span>
      </label>
    {/if}
    {#if data.fields.displayProductDescription && data.fields.appType && data.fields.projectLanguageCode}
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">{m.tasks_product()}</span>
        </div>
        <input
          type="text"
          class="input input-bordered w-full"
          readonly
          value={data.productDescription}
        />
      </label>
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">{m.admin_settings_productDefinitions_type()}</span>
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
          <span class="label-text">{m.project_languageCode()}</span>
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
    <h3>{m.products_files_title()}</h3>
    <div class="w-full overflow-x-auto">
      <SortTable
        className="max-h-96"
        data={data.files}
        columns={[
          {
            id: 'artifactType',
            header: m.project_type(),
            data: (f) => f.ArtifactType,
            sortable: true
          },
          {
            id: 'fileSize',
            header: m.project_products_size(),
            data: (f) => f.FileSize,
            render: (s) => bytesToHumanSize(s),
            sortable: true
          },
          {
            id: 'url',
            header: m.tasks_files_link(),
            data: (f) => f.Url,
            render: (u) => `<a class="link" href="${u}" target="_blank">${u}</a>`
          }
        ]}
        onRowClick={(data) => {
          window.open(data.Url, '_blank')?.focus();
        }}
      />
    </div>
  {/if}
  {#if data?.reviewers?.length}
    <h3>{m.project_side_reviewers_title()}</h3>
    <div class="w-full overflow-x-auto">
      <SortTable
        className="max-h-96"
        data={data.reviewers}
        columns={[
          {
            id: 'name',
            header: m.common_name(),
            data: (r) => r.Name,
            sortable: true
          },
          {
            id: 'email',
            header: m.profile_email(),
            data: (r) => r.Email,
            sortable: true
          }
        ]}
      />
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
</style>
