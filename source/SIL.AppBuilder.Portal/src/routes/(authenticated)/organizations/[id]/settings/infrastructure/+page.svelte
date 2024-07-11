<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { org_useDefaultBuildEngineTitle } from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;
  const { form: superFormData, enhance, allErrors } = superForm(data.form, { resetForm: false });
</script>

<form action="" class="m-4" method="post" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <div class="flex flex-row">
    <div class="w-full">
      <div>
        <label>
          <div class="label flex flex-row">
            <div class="flex flex-col">
              <span class="">
                {org_useDefaultBuildEngineTitle()}
              </span>
            </div>
            <input
              name="useDefaultBuildEngine"
              class="toggle toggle-primary"
              type="checkbox"
              bind:checked={$superFormData.useDefaultBuildEngine}
            />
          </div>
        </label>
      </div>
      <LabeledFormInput name="org_buildEngineUrl">
        <input
          type="text"
          name="buildEngineUrl"
          class="input w-full input-bordered"
          bind:value={$superFormData.buildEngineUrl}
        />
      </LabeledFormInput>
      <LabeledFormInput name="org_buildEngineApiAccessToken">
        <input
          type="text"
          name="buildEngineApiAccessToken"
          class="input w-full input-bordered"
          bind:value={$superFormData.buildEngineApiAccessToken}
        />
      </LabeledFormInput>
    </div>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
