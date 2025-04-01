<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  interface Props {
    roles: RoleId[];
  }

  let { roles = $bindable() }: Props = $props();
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    {#each Object.values(RoleId).filter((r) => r !== RoleId.SuperAdmin) as role}
      <div class="flex space-x-2">
        <input type="checkbox" class="toggle toggle-accent" value={role} bind:group={roles} />
        <span>{m.users_roles({ role })}</span>
      </div>
    {/each}
  </div>
  <div class="grow"></div>
</div>
