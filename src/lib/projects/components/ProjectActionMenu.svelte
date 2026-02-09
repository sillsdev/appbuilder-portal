<script lang="ts">
  import type { Infer, SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { ProjectActionSchema, ProjectForAction } from '$lib/projects';
  import { canArchive, canClaimProject, canReactivate } from '$lib/projects';
  import { toast } from '$lib/utils';

  interface Props {
    data: SuperValidated<Infer<ProjectActionSchema>>;
    project: ProjectForAction;
    /** allow actions other than reactivation */
    allowActions?: boolean;
    allowReactivate?: boolean;
    userGroups: number[];
    endpoint?: string;
    onUpdated?: (operation: string) => void;
  }

  let {
    data,
    project,
    allowActions = true,
    allowReactivate = true,
    userGroups,
    endpoint = 'projectAction',
    onUpdated
  }: Props = $props();

  const { form, enhance, submit } = superForm(data, {
    dataType: 'json',
    invalidateAll: false,
    warnings: { duplicateId: false },
    onChange: (event) => {
      if (event.paths.includes('operation') && $form.operation) {
        submit();
      }
    },
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    },
    onUpdated: ({ form }) => {
      onUpdated?.(form.data.operation!);
    }
  });
</script>

<Dropdown
  class={{
    dropdown: 'dropdown-bottom dropdown-end',
    label: 'max-h-fit min-h-fit p-1 inline',
    content: 'p-1 min-w-36 w-auto'
  }}
  onclick={() => {
    $form.projectId = project.Id;
  }}
>
  {#snippet label()}
    <IconContainer icon="charm:menu-kebab" width={20} />
  {/snippet}
  {#snippet content()}
    <form method="POST" action="?/{endpoint}" use:enhance>
      <input type="hidden" name="projectId" value={project.Id} />
      <ul class="menu overflow-hidden rounded-md">
        {#if allowActions && canArchive(project, page.data.session!.user)}
          <li class="w-full rounded-none">
            <BlockIfJobsUnavailable class="text-nowrap">
              {#snippet altContent()}
                <IconContainer icon="material-symbols:archive" width={20} />
                {m.common_archive()}
              {/snippet}
              <label class="text-nowrap">
                {@render altContent()}
                <input class="hidden" type="radio" bind:group={$form.operation} value="archive" />
              </label>
            </BlockIfJobsUnavailable>
          </li>
        {/if}
        {#if allowReactivate && canReactivate(project, page.data.session!.user)}
          <li class="w-full rounded-none">
            <BlockIfJobsUnavailable class="text-nowrap">
              {#snippet altContent()}
                <IconContainer icon="mdi:archive-refresh" width={20} />
                {m.common_reactivate()}
              {/snippet}
              <label class="text-nowrap">
                {@render altContent()}
                <input
                  class="hidden"
                  type="radio"
                  bind:group={$form.operation}
                  value="reactivate"
                />
              </label>
            </BlockIfJobsUnavailable>
          </li>
        {/if}
        {#if canClaimProject(page.data.session!.user, project.OwnerId, project.OrganizationId, project.GroupId, userGroups)}
          <li class="w-full rounded-none">
            <BlockIfJobsUnavailable class="text-nowrap">
              {#snippet altContent()}
                <IconContainer icon="mdi:user-add" width={20} />
                {m.project_claimOwnership()}
              {/snippet}
              <label class="text-nowrap">
                {@render altContent()}
                <input class="hidden" type="radio" bind:group={$form.operation} value="claim" />
              </label>
            </BlockIfJobsUnavailable>
          </li>
        {/if}
      </ul>
    </form>
  {/snippet}
</Dropdown>
