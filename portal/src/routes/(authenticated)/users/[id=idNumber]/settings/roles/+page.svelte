<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prismaTypes';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col pr-4">
    {#each $form.organizations as org}
      <h3>{org.name}</h3>
      <!-- TODO i18n -->
      <div class="flex w-full">
        <div class="shrink space-y-2">
          <div class="flex space-x-2 place-content-between">
            <span>AppBuilder</span>
            <input
              type="checkbox"
              class="toggle toggle-info"
              value={RoleId.AppBuilder}
              bind:group={org.roles}
            />
          </div>
          <div class="flex space-x-2 place-content-between">
            <span>Author</span>
            <input
              type="checkbox"
              class="toggle toggle-info"
              value={RoleId.Author}
              bind:group={org.roles}
            />
          </div>
          <div class="flex space-x-2 place-content-between">
            <span>Organization Admin</span>
            <input
              type="checkbox"
              class="toggle toggle-info"
              value={RoleId.OrgAdmin}
              bind:group={org.roles}
            />
          </div>
        </div>
        <div class="grow" />
      </div>
    {/each}
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
