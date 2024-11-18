<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import SortTable from '$lib/components/SortTable.svelte';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { FormResult } from 'sveltekit-superforms';
  import { writable } from 'svelte/store';

  export let data: PageData;

  const instances = writable(data.instances);
  const count = writable(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (!(event.paths.includes('page.size') || event.paths.includes('search'))) {
        submit();
      }
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{
        query: { data: any[]; count: number };
      }>;
      if (event.form.valid && data.query) {
        instances.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });
</script>

<div class="w-full">
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 mobile-sizing"
    >
      <div class="inline-block grow mobile-sizing">
        <h1 class="py-4 px-2">{m.admin_settings_workflowInstances_title()}</h1>
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 mobile-sizing"
      >
        <SearchBar bind:value={$form.search} className="w-full max-w-xs md:w-auto md:max-w-none" />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 mobile-sizing">
      <select class="select select-bordered mobile-sizing" bind:value={$form.workflowDefinitionId}>
        <option value={null} selected>{m.admin_settings_workflowDefinitions_all()}</option>
        {#each data.workflowDefinitions as pD}
          <option value={pD.Id}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={$form.dateUpdatedRange}
        placeholder={m.admin_settings_workflowInstances_filters_dateRange()}
      />
    </div>
  </form>
  <div class="m-4 relative mt-1">
    {#if $instances.length > 0}
      <SortTable
        data={$instances}
        columns={[
          {
            id: 'product',
            header: m.tasks_product(),
            data: (i) => i.ProductId,
            render: (c) =>
              `<a class="link" href="/admin/settings/workflow-instances/${c}">${
                c.slice(0, 3) + '...' + c.slice(-3)
              }</a>`,
            sortable: true
          },
          {
            id: 'workflow',
            header: m.admin_settings_workflowDefinitions_name(),
            data: (i) => i.WorkflowDefinition.Name,
            sortable: true
          },
          {
            id: 'state',
            header: m.project_products_transitions_state(),
            data: (i) => i.State,
            sortable: true
          },
          {
            id: 'date',
            header: m.admin_settings_buildEngines_lastUpdated(),
            data: (i) => i.DateUpdated,
            render: (c) => c?.toLocaleString() ?? '',
            sortable: true
          }
        ]}
        serverSide={true}
        maxh_class="max-h-full"
        on:sort={(e) => form.update((data) => ({ ...data, sort: e.detail }))}
      />
    {:else}
      <p class="m-8">{m.admin_settings_workflowInstances_empty()}</p>
    {/if}
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div class="w-full flex flex-row place-content-start p-4 space-between-4 flex-wrap gap-1">
      <Pagination bind:size={$form.page.size} total={$count} bind:page={$form.page.page} />
    </div>
  </form>
</div>

<style lang="postcss">
  .mobile-sizing {
    @apply w-full max-w-xs;
  }
  @media screen(md) {
    .mobile-sizing {
      @apply w-auto max-w-none;
    }
  }
</style>
