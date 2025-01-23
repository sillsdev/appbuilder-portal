<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import SortTable from '$lib/components/SortTable.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime } from '$lib/timeUtils';
  import { writable } from 'svelte/store';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const instances = writable(data.instances);
  const count = writable(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (!event.paths.includes('search')) {
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
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    onkeydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 mobile-sizing"
    >
      <div class="inline-block grow mobile-sizing">
        <h1 class="py-4 px-2">{m.workflowInstances_title()}</h1>
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 mobile-sizing"
      >
        <select class="select select-bordered mobile-sizing" bind:value={$form.organizationId}>
          <option value={null} selected>{m.org_allOrganizations()}</option>
          {#each data.organizations as organization}
            <option value={organization.Id}>{organization.Name}</option>
          {/each}
        </select>
        <SearchBar bind:value={$form.search} className="w-full max-w-xs md:w-auto md:max-w-none" />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 mobile-sizing">
      <select class="select select-bordered mobile-sizing" bind:value={$form.productDefinitionId}>
        <option value={null} selected>{m.productDefinitions_filterAllProjects()}</option>
        {#each data.productDefinitions as pD}
          <option value={pD.Id}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={$form.dateUpdatedRange}
        placeholder={m.workflowInstances_filters_dateRange()}
      />
    </div>
  </form>
  <div class="m-4 relative mt-1 w-full overflow-x-auto">
    {#if $instances.length > 0}
      <SortTable
        data={$instances}
        columns={[
          {
            id: 'organization',
            header: m.project_side_organization(),
            data: (i) => i.Product.Project.Organization,
            render: (o) => `<a class="link" href="/projects/organization/${o.Id}">${o.Name}</a>`,
            sortable: true
          },
          {
            id: 'project',
            header: m.project_title(),
            data: (i) => i.Product.Project,
            render: (c) => `<a class="link" href="/projects/${c.Id}">${c.Name}</a>`,
            sortable: true
          },
          {
            id: 'product',
            header: m.tasks_product(),
            data: (i) => i.Product,
            render: (c) =>
              `<a class="link" href="/workflow-instances/${c.Id}">${c.ProductDefinition.Name}</a>`,
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
            header: m.common_updated(),
            data: (i) => i.DateUpdated,
            render: (c) => getRelativeTime(c),
            sortable: true
          }
        ]}
        serverSide={true}
        className="max-h-full"
        on:sort={(e) => form.update((data) => ({ ...data, sort: e.detail }))}
      />
    {:else}
      <p class="m-8">{m.workflowInstances_empty()}</p>
    {/if}
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    onkeydown={(event) => {
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
