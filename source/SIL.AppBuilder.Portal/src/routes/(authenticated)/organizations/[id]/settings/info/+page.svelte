<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { org_noteLogUrl } from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance, allErrors } = superForm(data.form, { resetForm: false });
</script>

<form action="" class="m-4" method="post" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <div class="flex flex-row">
    <div>
      <LabeledFormInput name="org_orgName">
        <input
          type="text"
          name="name"
          class="input w-full input-bordered"
          bind:value={$superFormData.name}
        />
      </LabeledFormInput>
      <LabeledFormInput name="org_logoUrl">
        <input
          type="text"
          name="logoUrl"
          class="input w-full input-bordered"
          bind:value={$superFormData.logoUrl}
        />
        <span>{org_noteLogUrl()}</span>
      </LabeledFormInput>
    </div>
    <div class="w-1/3 ml-4">
      <img src={$superFormData.logoUrl} alt="Logo" class="object-contain" />
    </div>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
