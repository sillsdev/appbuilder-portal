<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let organizations;
  const dispatch = createEventDispatcher();
</script>

<div class="w-full px-4">
  <table class="w-full">
    <thead>
      <tr class="text-left">
        <th>Organization</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      {#each organizations as org}
        <tr
          class="h-16 border-y hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer"
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
        </tr>
      {/each}
    </tbody>
  </table>
</div>
