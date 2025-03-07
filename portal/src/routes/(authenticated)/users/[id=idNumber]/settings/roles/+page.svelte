<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import RolesSelector from '../../../RolesSelector.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false
  });
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col px-4">
    {#each $form.organizations as org}
      <h3>{org.name}</h3>
      <!-- https://github.com/sveltejs/svelte/issues/12721#issuecomment-2269544690 -->
      <!-- svelte-ignore binding_property_non_reactive -->
      <RolesSelector bind:roles={org.roles} />
    {/each}
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
