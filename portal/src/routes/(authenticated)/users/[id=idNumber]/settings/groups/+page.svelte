<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col px-4">
    {#each $form.organizations as org}
      <h3>{org.name}</h3>
      <div class="flex w-full">
        <div class="shrink space-y-2">
          {#each data.groups.filter((g) => g.orgId === org.id) as group}
            <div class="flex space-x-2">
              <input
                type="checkbox"
                class="toggle toggle-info"
                value={group.id}
                bind:group={org.groups}
              />
              <span>{group.name}</span>
            </div>
          {/each}
        </div>
        <div class="grow" />
      </div>
    {/each}
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
