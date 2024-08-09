<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { createEventDispatcher } from 'svelte';
  export let organizations: Prisma.OrganizationsGetPayload<{
    include: {
      Owner: true;
    };
  }>[];
  const dispatch = createEventDispatcher<{
    select: { id: number };
  }>();
</script>

<div class="w-full px-4">
  <table class="w-full">
    <thead>
      <tr class="text-left">
        <!-- i18n -->
        <th>Organization</th>
        <th>Owner</th>
        <!-- <th>Projects</th> -->
      </tr>
    </thead>
    <tbody>
      {#each organizations as org}
        <tr
          class="h-16 border-y hover:bg-base-200 cursor-pointer"
          on:click={() => dispatch('select', { id: org.Id })}
        >
          <td>
            {#if org.LogoUrl}
              <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
            {:else}
              <div class="inline-block p-2 h-16 w-16 align-middle">
                <div class="bg-white w-full h-full" />
              </div>
            {/if}
            <span>
              {org.Name}
            </span>
          </td>
          <td>
            {org.Owner.Name}
          </td>
          <!-- <td>
            {org.Projects.length}
          </td> -->
        </tr>
      {/each}
    </tbody>
  </table>
</div>
