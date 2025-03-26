<script lang="ts">
  import { page } from '$app/state';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import { m } from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';

  const textsForPaths = new Map([
    ['all', m.projects_switcher_dropdown_all()],
    ['own', m.projects_switcher_dropdown_myProjects()],
    ['organization', m.projects_switcher_dropdown_orgProjects()],
    ['active', m.projects_switcher_dropdown_activeProjects()],
    ['archived', m.projects_switcher_dropdown_archived()]
  ]);
  let open = $state(false);
</script>

<Dropdown
  dropdownClasses="dropdown-start"
  labelClasses="no-animation hover:bg-transparent"
  contentClasses="overflow-y-auto left-2 p-2 border m-2"
  bind:open
>
  {#snippet label()}
    <h1 class="p-4 pl-6 cursor-pointer">
      <div class="flex flex-row items-center">
        {textsForPaths.get(page.params.filter)}
        <div class="dropdown-icon" class:open>
          <Icon width="24" class="dropdown-icon" icon="gridicons:dropdown" />
        </div>
      </div>
    </h1>
  {/snippet}
  {#snippet content()}
    <div class="px-4">
      {#each textsForPaths as route}
        <a
          href="/projects/{route[0]}{page.params.id ? '/' + page.params.id : ''}"
          class:font-extrabold={page.params.filter === route[0]}
          class="p-1 text-nowrap block"
        >
          {route[1]}
        </a>
      {/each}
    </div>
  {/snippet}
</Dropdown>

<style>
  .dropdown-icon {
    transition: transform 0.15s;
    transform: rotate(0deg);
  }
  .dropdown-icon.open {
    transform: rotate(180deg);
  }
</style>
