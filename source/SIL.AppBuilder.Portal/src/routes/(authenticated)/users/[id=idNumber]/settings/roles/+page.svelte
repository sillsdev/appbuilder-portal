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
    <RolesSelector bind:organizations={$form.organizations} />
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
