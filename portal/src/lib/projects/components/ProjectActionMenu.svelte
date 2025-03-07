<script lang="ts">
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { Infer, SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { ProjectActionSchema, ProjectForAction } from '../common';
  import { canArchive, canClaimProject, canReactivate } from '../common';

  
  interface Props {
    data: SuperValidated<Infer<ProjectActionSchema>>;
    project: ProjectForAction;
    /** allow actions other than reactivation */
    allowActions?: boolean;
    allowReactivate?: boolean;
    userGroups: number[];
    endpoint?: string;
  }

  let {
    data,
    project,
    allowActions = true,
    allowReactivate = true,
    userGroups,
    endpoint = 'projectAction'
  }: Props = $props();

  const { form, enhance, submit } = superForm(data, {
    dataType: 'json',
    invalidateAll: true,
    warnings: { duplicateId: false },
    onChange: (event) => {
      if (event.paths.includes('operation') && $form.operation) {
        submit();
      }
    }
  });

  function canClaimOwnership(project: Omit<ProjectForAction, 'Id' | 'Name'>): boolean {
    return (
      project.OwnerId !== page.data.session?.user.userId &&
      canClaimProject(
        page.data.session,
        project.OwnerId,
        parseInt(page.params.id),
        project.GroupId,
        userGroups
      )
    );
  }

  let dropdownOpen: boolean = $state(false);

  function close() {
    dropdownOpen = false;
  }
</script>

<svelte:window onclick={() => close()} />

<details class="dropdown dropdown-bottom dropdown-end" bind:open={dropdownOpen}>
  <summary
    class="btn btn-ghost max-h-fit min-h-fit p-1 inline"
    onclick={() => {
      $form.projectId = project.Id;
    }}
  >
    <IconContainer icon="charm:menu-kebab" width={20} />
  </summary>
  <div class="dropdown-content p-1 bg-base-200 z-10 rounded-md min-w-36 w-auto shadow-lg">
    <form method="POST" action="?/{endpoint}" use:enhance>
      <input type="hidden" name="singleId" value={project.Id} />
      <ul class="menu menu-compact overflow-hidden rounded-md">
        {#if allowActions && canArchive(project, page.data.session, parseInt(page.params.id))}
          <li class="w-full rounded-none">
            <label class="text-nowrap">
              {m.common_archive()}
              <input class="hidden" type="radio" bind:group={$form.operation} value="archive" />
            </label>
          </li>
        {/if}
        {#if allowReactivate && canReactivate(project, page.data.session, parseInt(page.params.id))}
          <li class="w-full rounded-none">
            <label class="text-nowrap">
              {m.common_reactivate()}
              <input class="hidden" type="radio" bind:group={$form.operation} value="reactivate" />
            </label>
          </li>
        {/if}
        {#if canClaimOwnership(project)}
          <li class="w-full rounded-none">
            <label class="text-nowrap">
              {m.project_claimOwnership()}
              <input class="hidden" type="radio" bind:group={$form.operation} value="claim" />
            </label>
          </li>
        {/if}
      </ul>
    </form>
  </div>
</details>
