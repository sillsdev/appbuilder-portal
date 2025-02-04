<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { org_useDefaultBuildEngineTitle } from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, allErrors } = superForm(data.form, { resetForm: false });
</script>

<form action="" class="m-4" method="post" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
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
              class="toggle toggle-accent"
              type="checkbox"
              bind:checked={$form.useDefaultBuildEngine}
            />
          </div>
        </label>
      </div>
      {#if !$form.useDefaultBuildEngine}
        <LabeledFormInput name="org_buildEngineUrl">
          <input
            type="text"
            name="buildEngineUrl"
            class="input w-full input-bordered"
            bind:value={$form.buildEngineUrl}
          />
        </LabeledFormInput>
        <LabeledFormInput name="org_buildEngineApiAccessToken">
          <input
            type="text"
            name="buildEngineApiAccessToken"
            class="input w-full input-bordered"
            bind:value={$form.buildEngineApiAccessToken}
          />
        </LabeledFormInput>
      {/if}
    </div>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>
