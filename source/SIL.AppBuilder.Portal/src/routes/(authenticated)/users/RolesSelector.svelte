<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  interface Props {
    organizations: { name: string; roles: RoleId[] }[];
  }

  let { organizations = $bindable() }: Props = $props();
</script>

{#each organizations as org}
  <h3>{org.name}</h3>
  <div class="flex w-full">
    <div class="shrink space-y-2">
      <div class="flex space-x-2">
        <input
          type="checkbox"
          class="toggle toggle-accent"
          value={RoleId.AppBuilder}
          bind:group={org.roles}
        />
        <span>{m.users_roles_appBuilder()}</span>
      </div>
      <div class="flex space-x-2">
        <input
          type="checkbox"
          class="toggle toggle-accent"
          value={RoleId.Author}
          bind:group={org.roles}
        />
        <span>{m.users_roles_author()}</span>
      </div>
      <div class="flex space-x-2">
        <input
          type="checkbox"
          class="toggle toggle-accent"
          value={RoleId.OrgAdmin}
          bind:group={org.roles}
        />
        <span>{m.users_roles_orgAdmin()}</span>
      </div>
    </div>
    <div class="grow"></div>
  </div>
{/each}
