<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import SortTable from '$lib/components/SortTable.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { getRelativeTime } from '$lib/timeUtils';
  import { byName } from '$lib/utils';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let instances = $state(data.instances);
  let count = $state(data.count);

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
        instances = data.query.data;
        count = data.query.count;
      }
    }
  });

  const mobileSizing = 'w-full max-w-xs md:w-auto md:max-w-none';
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
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 {mobileSizing}"
    >
      <div class="inline-block grow {mobileSizing}">
        <h1 class="py-4 px-2">{m.workflowInstances_title()}</h1>
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 {mobileSizing}"
      >
        <OrganizationDropdown
          className={mobileSizing}
          organizations={data.organizations}
          allowNull={true}
          bind:value={$form.organizationId}
        />
        <SearchBar bind:value={$form.search} className={mobileSizing} />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 {mobileSizing}">
      <select class="select select-bordered {mobileSizing}" bind:value={$form.productDefinitionId}>
        <option value={null} selected>{m.productDefinitions_filterAllProjects()}</option>
        {#each data.productDefinitions.toSorted((a, b) => byName(a, b, languageTag())) as pD}
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
    {#if instances.length > 0}
      {@const langTag = languageTag()}
      <SortTable
        data={instances}
        columns={[
          {
            // This will not sort by locale... need a good solution...
            id: 'organization',
            header: m.project_side_organization(),
            compare: () => 0
          },
          {
            id: 'project',
            header: m.project_title(),
            compare: () => 0
          },
          {
            id: 'definition',
            header: m.tasks_product(),
            compare: () => 0
          },
          {
            id: 'state',
            header: m.project_products_transitions_state(),
            compare: () => 0
          },
          {
            id: 'date',
            header: m.common_updated(),
            compare: () => 0
          }
        ]}
        serverSide={true}
        className="max-h-full"
        onSort={(field, direction) =>
          form.update((data) => ({ ...data, sort: { field, direction } }))}
      >
        {#snippet row(instance)}
          {@const project = instance.Product.Project}
          {@const org = project.Organization}
          {@const prodDef = instance.Product.ProductDefinition}
          <tr class="cursor-pointer hover:bg-neutral">
            <td class="border">
              <a class="link" href="/projects/organization/{org.Id}">
                {org.Name}
              </a>
            </td>
            <td class="border">
              <a class="link" href="/projects/{project.Id}">{project.Name}</a>
            </td>
            <td class="border">
              <a class="link" href="/workflow-instances/{instance.Product.Id}">
                {prodDef.Name}
              </a>
            </td>
            <td class="border">{instance.State}</td>
            <td class="border">
              <Tooltip className="text-left" tip={instance.DateUpdated?.toLocaleString(langTag)}>
                {getRelativeTime(instance.DateUpdated)}
              </Tooltip>
            </td>
          </tr>
        {/snippet}
      </SortTable>
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
      <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
    </div>
  </form>
</div>
