<script lang="ts" module>
  /** Shows details modal for product with productId */
  export function showProjectDetails(projectId: string) {
    // optional chaining for if element isn't found or isn't actually a Dialog Element
    (document.getElementById('modal' + projectId) as HTMLDialogElement)?.showModal?.();
  }

  export interface Props extends OptionalParams {
    project: Prisma.ProjectsGetPayload<{
      select: { Id: true };
    }>;
    actions: Action[];
  }
</script>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import ProjectActionEntry, {
    type Action,
    type OptionalParams
  } from './ProjectActionEntry.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';

  // eslint-disable-next-line svelte/valid-compile
  let { project, actions, ...params }: Props = $props();

  let detailsModal: HTMLDialogElement;
</script>

<dialog bind:this={detailsModal} id="modal{project.Id}" class="modal">
  <div class="modal-box w-11/12 max-w-6xl">
    <div class="flex flex-row">
      <h1 class="pl-0 grow">{m.products_details()}</h1>
      <button
        class="btn btn-ghost"
        type="button"
        onclick={() => {
          detailsModal?.close();
        }}
        title={m.common_close()}
      >
        <IconContainer icon={Icons.Close} width={36} class="opacity-80" />
      </button>
    </div>
    <table class="hidden md:table table-sm">
      <thead>
        <tr>
          <th>{m.project_details_action()}</th>
          <th>{m.transitions_user()}</th>
          <th>{m.project_details_title()}</th>
          <th>{m.transitions_date()}</th>
        </tr>
      </thead>
      <tbody>
        {#each actions as act}
          <ProjectActionEntry {act} compact={false} {...params} />
        {/each}
      </tbody>
    </table>
    <table class="table table-sm md:hidden">
      <thead>
        <tr>
          <th>{m.project_details_action()}</th>
          <th>{m.transitions_date()} / {m.transitions_user()}</th>
        </tr>
      </thead>
      <tbody>
        {#each actions as act}
          <ProjectActionEntry {act} compact={true} {...params} />
        {/each}
      </tbody>
    </table>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

<style>
  table :global(:where(thead tr)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
  table :global(:where(tbody tr:not(:last-child))) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
</style>
