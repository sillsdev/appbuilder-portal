<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    resetForm: false,
    onUpdated({ form }) {
      if (form.valid) {
        toast('success', m.common_updated());
      }
    }
  });
</script>

<form action="" class="m-4" method="post" use:enhance>
  <div class="flex flex-row">
    <div class="w-full">
      <LabeledFormInput
        key="org_name"
        input={{
          name: 'name',
          err: m.formErrors_nameEmpty(),
          icon: Icons.Name,
          required: true
        }}
        bind:value={$form.name}
      />
      <LabeledFormInput
        key="project_orgContact"
        input={{
          type: 'email',
          name: 'contact',
          err: m.formErrors_emailInvalid(),
          icon: Icons.Email
        }}
        bind:value={$form.contact}
      />
      <LabeledFormInput
        key="org_logoURL"
        input={{
          name: 'logoUrl',
          type: 'url',
          icon: Icons.Image
        }}
        bind:value={$form.logoUrl}
      />
      <div class="w-1/3 mx-auto sm:hidden">
        <img src={$form.logoUrl} alt="Logo" class="object-contain" />
      </div>
    </div>
    <div class="w-1/3 ml-4 hidden sm:block">
      <img src={$form.logoUrl} alt="Logo" class="object-contain" />
    </div>
  </div>
  <div class="my-4">
    <SubmitButton />
  </div>
</form>
