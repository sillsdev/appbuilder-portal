<script lang="ts">
  import { page } from '$app/state';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { ProjectActionSchema, ProjectForAction } from '$lib/projects';
  import { canArchive, canClaimProject, canReactivate } from '$lib/projects';
  import type { Infer, SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';

  interface Props {
    data: SuperValidated<Infer<ProjectActionSchema>>;
    project: ProjectForAction;
    /** allow actions other than reactivation */
    allowActions?: boolean;
    allowReactivate?: boolean;
    userGroups: number[];
    endpoint?: string;
    orgId: number;
  }

  let {
    data,
    project,
    allowActions = true,
    allowReactivate = true,
    userGroups,
    endpoint = 'projectAction',
    orgId
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
      canClaimProject(page.data.session, project.OwnerId, orgId, project.GroupId, userGroups)
    );
  }
</script>

<Dropdown
  dropdownClasses="dropdown-bottom dropdown-end"
  labelClasses="max-h-fit min-h-fit p-1 inline"
  contentClasses="p-1 min-w-36 w-auto"
  onclick={() => {
    $form.projectId = project.Id;
    $form.orgId = orgId;
  }}
>
  {#snippet label()}
    <IconContainer icon="charm:menu-kebab" width={20} />
  {/snippet}
  {#snippet content()}
    <form method="POST" action="?/{endpoint}" use:enhance>
      <input type="hidden" name="projectId" value={project.Id} />
      <input type="hidden" name="orgId" value={orgId} />
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
  {/snippet}
</Dropdown>
