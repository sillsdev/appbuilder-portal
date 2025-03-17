<script lang="ts">
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import type { Prisma } from '@prisma/client';
  interface Props {
    organizations: Prisma.OrganizationsGetPayload<{
      include: {
        Owner: true;
      };
    }>[];
    onSelect: (id: number) => void;
  }

  let { organizations, onSelect }: Props = $props();
</script>

<div class="w-full px-4">
  <table class="w-full">
    <thead>
      <tr class="text-left">
        <!-- TODO: i18n -->
        <th>Organization</th>
        <th>Owner</th>
        <!-- <th>Projects</th> -->
      </tr>
    </thead>
    <tbody>
      {#each organizations.toSorted((a, b) => byName(a, b, languageTag())) as org}
        <tr
          class="h-16 border-y hover:bg-base-200 cursor-pointer"
          onclick={() => onSelect(org.Id)}
        >
          <td>
            {#if org.LogoUrl}
              <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
            {:else}
              <div class="inline-block p-2 h-16 w-16 align-middle">
                <div class="bg-white w-full h-full"></div>
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
