<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';

  // Data structure for a software rebuild
  interface RebuildData {
    Id: number;
    Comment: string;
    DateCreated: Date | null;
    DateCompleted: Date | null;
    Version: string;
    Paused: boolean;
    InitiatedBy: {
      Name: string | null;
      Email: string | null;
    };
    ApplicationType: {
      Name: string | null;
      Description: string | null;
    };
    Projects: Array<{
      Id: number;
      Name: string | null;
    }>;
    _count: {
      Products: number;
    };
  }

  // Props for the RebuildCard component
  interface Props {
    rebuild: RebuildData;
  }

  // Extract props
  let { rebuild }: Props = $props();

  // Derived values for display
  const isActive = $derived(!rebuild.DateCompleted && !rebuild.Paused);
  const locale = getLocale();
</script>

<div class="rounded-md bg-neutral border border-slate-400 my-6 overflow-hidden w-full">
  <div class="p-4 pb-2 w-full">
    <div class="flex flex-wrap justify-between p-2">
      <div class="mr-2">
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:user" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_initiated_by()}:</span>
          {rebuild.InitiatedBy.Name || rebuild.InitiatedBy.Email || 'Unknown User'}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:application" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">AppType:</span>
          {rebuild.ApplicationType.Name}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:tag" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">Version:</span>
          {rebuild.Version}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:package-variant" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">Products:</span>
          {rebuild._count.Products}
        </span>
      </div>
      <div class ="items-left">
        <span class="flex items-center">
          <span class="text-nowrap overflow-hidden text-center mr-1">
              <IconContainer icon="mdi:calendar-plus" width={20} class=" shrink-0" />
              <span class="font-semibold">Created:</span>
          </span>
          <span class="w-40 text-center">{getTimeDateString(rebuild.DateCreated)}</span>
        </span>

        {#if rebuild.DateCompleted}
          <span class="flex items-center">
            <span class="overflow-hidden text-nowrap mr-1">
              <IconContainer icon="mdi:calendar-check" width={20} class="shrink-0" />
              <span class="font-semibold">Completed:</span>
            </span>
            <span class="text-nowrap w-40 text-center"> 
              {getTimeDateString(rebuild.DateCompleted)}
            </span>
          </span>
        {/if}
      </div>
    </div>
     <div class="text-sm opacity-75 pl-2">
          <span class="flex items-center">
            <span class="overflow-hidden text-nowrap">
              {m.admin_nav_software_update_comment()}:
            </span>
            <span class="text-nowrap w-40 text-left ml-2">
              {rebuild.Comment}
            </span>
        </span>
    </div>
  </div>

  <div class="w-full bg-base-100 p-6 pt-2">
    {#if rebuild.Projects.length > 0}
      <div class="mb-2">
        <span class="font-semibold">Projects:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each rebuild.Projects.toSorted((a, b) => byString(a.Name, b.Name, locale)) as project}
          <a
            href={`/projects/${project.Id}`}
            class="badge badge-primary badge-lg hover:badge-accent transition-colors"
          >
            {project.Name}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>


