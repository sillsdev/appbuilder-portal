<script lang="ts">
  interface Props {
    organizations: { id: number; name: string; groups: number[] }[];
    groups: { id: number; name: string; orgId: number }[];
  }

  let { organizations, groups }: Props = $props();
</script>

{#each organizations as org}
  <h3>{org.name}</h3>
  <div class="flex w-full">
    <div class="shrink space-y-2">
      {#each groups.filter((g) => g.orgId === org.id) as group}
        <div class="flex space-x-2">
          <input
            type="checkbox"
            class="toggle toggle-accent"
            value={group.id}
            bind:group={org.groups}
          />
          <span>{group.name}</span>
        </div>
      {/each}
    </div>
    <div class="grow"></div>
  </div>
{/each}
