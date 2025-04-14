<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

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
  <input type="hidden" name="id" value={$form.id} />
  <div class="flex flex-row">
    <div>
      <LabeledFormInput name="org_orgName">
        <input
          type="text"
          name="name"
          class="input w-full input-bordered validator"
          bind:value={$form.name}
          required
        />
        <span class="validator-hint">{m.org_nameError()}</span>
      </LabeledFormInput>
      <LabeledFormInput name="org_logoUrl">
        <input
          type="url"
          name="logoUrl"
          class="input w-full input-bordered"
          bind:value={$form.logoUrl}
        />
        <span>{m.org_noteLogUrl()}</span>
      </LabeledFormInput>
    </div>
    <div class="w-1/3 ml-4">
      <img src={$form.logoUrl} alt="Logo" class="object-contain" />
    </div>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>
