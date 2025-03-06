<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  interface Props {
    roles: RoleId[];
  }

  let { roles = $bindable() }: Props = $props();
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    <div class="flex space-x-2">
      <input
        type="checkbox"
        class="toggle toggle-accent"
        value={RoleId.AppBuilder}
        bind:group={roles}
      />
      <span>{m.users_roles_appBuilder()}</span>
    </div>
    <div class="flex space-x-2">
      <input
        type="checkbox"
        class="toggle toggle-accent"
        value={RoleId.Author}
        bind:group={roles}
      />
      <span>{m.users_roles_author()}</span>
    </div>
    <div class="flex space-x-2">
      <input
        type="checkbox"
        class="toggle toggle-accent"
        value={RoleId.OrgAdmin}
        bind:group={roles}
      />
      <span>{m.users_roles_orgAdmin()}</span>
    </div>
  </div>
  <div class="grow"></div>
</div>
