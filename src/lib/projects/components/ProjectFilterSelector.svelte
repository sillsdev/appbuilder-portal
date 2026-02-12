<script lang="ts">
  import Icon from '@iconify/svelte';
  import { page } from '$app/state';
  import Dropdown, { type DropdownClasses } from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    filter: string;
    class?: DropdownClasses;
  }

  let { filter, class: classes }: Props = $props();

  const textsForPaths = new Map([
    ['all', { msg: m.projects_filter_all(), ic: 'fluent-mdl2:all-apps' }],
    ['own', { msg: m.projects_filter_own(), ic: 'mdi:user' }],
    ['organization', { msg: m.projects_filter_org(), ic: 'clarity:organization-solid' }],
    ['active', { msg: m.projects_filter_active(), ic: 'hugeicons:activity-03' }],
    ['archived', { msg: m.projects_filter_archived(), ic: 'mdi:archive' }]
  ]);
  let open = $state(false);
</script>

<Dropdown
  class={{
    dropdown: ['dropdown-start', classes?.dropdown],
    label: ['no-animation hover:bg-transparent', classes?.label],
    content: ['overflow-y-auto left-2 p-2 border m-2', classes?.content]
  }}
  bind:open
>
  {#snippet label()}
    {@const route = textsForPaths.get(filter)!}
    <h1 class="p-4 pl-6 cursor-pointer">
      <div class="flex flex-row items-center">
        <IconContainer icon={route.ic} width={24} class="mr-1" />
        {route.msg}
        <div class="dropdown-icon" class:open>
          <Icon width="24" class="dropdown-icon" icon="gridicons:dropdown" />
        </div>
      </div>
    </h1>
  {/snippet}
  {#snippet content()}
    <div class="px-1">
      {#each textsForPaths as route}
        <a
          href={localizeHref(
            `/projects/${route[0]}${page.params.orgId ? '/' + page.params.orgId : ''}`
          )}
          class:font-extrabold={filter === route[0]}
          class="p-1 text-nowrap block"
        >
          <IconContainer icon={route[1].ic} width={20} />
          {route[1].msg}
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
