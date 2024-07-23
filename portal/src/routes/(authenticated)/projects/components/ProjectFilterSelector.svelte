<script lang="ts">
  import { page } from '$app/stores';
  import * as m from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';

  const textsForPaths = new Map([
    ['all', m.projects_switcher_dropdown_all()],
    ['own', m.projects_switcher_dropdown_myProjects()],
    ['organization', m.projects_switcher_dropdown_orgProjects()],
    ['active', m.projects_switcher_dropdown_activeProjects()],
    ['archived', m.projects_switcher_dropdown_archived()]
  ]);
</script>

<div class="dropdown dropdown-start">
  <!-- When .dropdown is focused, .dropdown-content is revealed making this actually interactive -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <h1 tabindex="0" class="p-4 pl-6 cursor-pointer">
    <div class="flex flex-row items-center">
      {textsForPaths.get($page.params.filter)}
      <div class="dropdown-icon">
        <Icon width="24" class="dropdown-icon" icon="gridicons:dropdown" />
      </div>
    </div>
  </h1>
  <div class="dropdown-content z-10 overflow-y-auto left-2">
    <div class="p-2 border m-2 rounded-md bg-base-200 px-4">
      {#each textsForPaths as route}
        <a
          href="/projects/{route[0]}{$page.params.id ? '/' + $page.params.id : ''}"
          class:font-extrabold={$page.params.filter === route[0]}
          class="p-1 text-nowrap block"
        >
          {route[1]}
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .dropdown-icon {
    transition: transform 0.15s;
    transform: rotate(0deg);
  }
  .dropdown:focus-within .dropdown-icon {
    transform: rotate(180deg);
  }
</style>
