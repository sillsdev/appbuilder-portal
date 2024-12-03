<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import GroupsSelector from '../../../GroupsSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col px-4">
    <GroupsSelector groups={data.groups} bind:organizations={$form.organizations} />
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
