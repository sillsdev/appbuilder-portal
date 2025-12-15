<script lang="ts">
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar, { focusSearchBar } from '$lib/components/SearchBar.svelte';
  import SortTable from '$lib/components/SortTable.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';
  import { byName } from '$lib/utils/sorting';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let instances = $state(data.instances);
  const instanceUpdated = $derived(getRelativeTime(instances.map((i) => i.DateUpdated)));
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
        query: { data: PageData['instances']; count: number };
      }>;
      if (event.form.valid && data.query) {
        instances = data.query.data;
        count = data.query.count;
      }
    },
    onUpdated() {
      if ($form.search) {
        focusSearchBar();
      }
    }
  });

  const mobileSizing = 'w-full md:w-auto';

  $effect(() => {
    $form.organizationId = $orgActive;
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
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 {mobileSizing}"
    >
      <div class="inline-block grow {mobileSizing}">
        <h1 class="py-4 px-2">{m.workflowInstances_title()}</h1>
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 {mobileSizing}"
      >
        <SearchBar bind:value={$form.search} class={mobileSizing} requestSubmit={submit} />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 {mobileSizing}">
      <select class="select select-bordered {mobileSizing}" bind:value={$form.productDefinitionId}>
        <option value={null} selected>{m.filters_allProdDefs()}</option>
        {#each data.productDefinitions.toSorted((a, b) => byName(a, b, getLocale())) as pD}
          <option value={pD.Id}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={$form.dateUpdatedRange}
        placeholder={m.filters_dateRange()}
      />
    </div>
  </form>
  <div class="p-4 relative mt-1 w-full overflow-x-auto">
    {#if instances.length > 0}
      <SortTable
        data={instances.map((instance, index) => ({ ...instance, i: index }))}
        columns={[
          // This will not sort by locale... need a good solution...
          {
            id: 'date',
            header: m.common_updated(),
            compare: () => 0
          },
          {
            id: 'project',
            header: m.project_title(),
            compare: () => 0
          }
        ]}
        serverSide={true}
        class="max-h-full sm:hidden"
        onSort={(field, direction) =>
          form.update((data) => ({ ...data, sort: { field, direction } }))}
        fixedLayout={false}
      >
        {#snippet row(instance)}
          {@const project = instance.Product.Project}
          {@const org = project.Organization}
          {@const prodDef = instance.Product.ProductDefinition}
          <tr>
            <td class="border">
              <Tooltip class="text-left" tip={getTimeDateString(instance.DateUpdated)}>
                {$instanceUpdated[instance.i]}
              </Tooltip>
            </td>
            <td class="border">
              <a class="link" href={localizeHref(`/projects/${project.Id}`)}>{project.Name}</a>
            </td>
          </tr>
          <tr>
            <td class="border">{instance.State}</td>
            <td class="border">
              <a class="link" href={localizeHref(`/projects/organization/${org.Id}`)}>
                {org.Name}
              </a>
            </td>
          </tr>
          <tr class="cursor-pointer hover:bg-neutral row">
            <td class="border border-b-base-content/50" colspan="2">
              <a class="link" href={localizeHref(`/workflow-instances/${instance.Product.Id}`)}>
                {prodDef.Name}
              </a>
            </td>
          </tr>
        {/snippet}
      </SortTable>
      <SortTable
        data={instances.map((instance, index) => ({ ...instance, i: index }))}
        columns={[
          // This will not sort by locale... need a good solution...
          {
            id: 'date',
            header: m.common_updated(),
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
            header: m.transitions_state(),
            compare: () => 0
          },
          {
            id: 'organization',
            header: m.project_org(),
            compare: () => 0
          }
        ]}
        serverSide={true}
        class="max-h-full hidden sm:block"
        onSort={(field, direction) =>
          form.update((data) => ({ ...data, sort: { field, direction } }))}
        fixedLayout={false}
      >
        {#snippet row(instance)}
          {@const project = instance.Product.Project}
          {@const org = project.Organization}
          {@const prodDef = instance.Product.ProductDefinition}
          <tr class="cursor-pointer hover:bg-neutral">
            <td class="border">
              <Tooltip class="text-left" tip={getTimeDateString(instance.DateUpdated)}>
                {$instanceUpdated[instance.i]}
              </Tooltip>
            </td>
            <td class="border">
              <a class="link" href={localizeHref(`/projects/${project.Id}`)}>{project.Name}</a>
            </td>
            <td class="border">
              <a class="link" href={localizeHref(`/workflow-instances/${instance.Product.Id}`)}>
                {prodDef.Name}
              </a>
            </td>
            <td class="border">{instance.State}</td>
            <td class="border">
              <a class="link" href={localizeHref(`/projects/organization/${org.Id}`)}>
                {org.Name}
              </a>
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
