<script lang="ts">
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
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
  <div class="flex flex-row">
    <div class="w-full">
      <InputWithMessage title={{ key: 'org_useDefaultBuildEngine' }}>
        <input
          name="useDefaultBuildEngine"
          class="toggle toggle-accent"
          type="checkbox"
          bind:checked={$form.useDefaultBuildEngine}
        />
      </InputWithMessage>
      {#if !$form.useDefaultBuildEngine}
        <LabeledFormInput name="org_buildEngineURL">
          <input
            type="url"
            name="buildEngineUrl"
            class="input input-bordered w-full validator"
            bind:value={$form.buildEngineUrl}
            required={!$form.useDefaultBuildEngine}
          />
          <span class="validator-hint">{m.org_emptyBuildEngineURL()}</span>
        </LabeledFormInput>
        <LabeledFormInput name="org_accessToken">
          <input
            type="text"
            name="buildEngineApiAccessToken"
            class="input input-bordered w-full validator"
            bind:value={$form.buildEngineApiAccessToken}
            required={!$form.useDefaultBuildEngine}
          />
          <span class="validator-hint">{m.org_emptyAccessToken()}</span>
        </LabeledFormInput>
      {/if}
    </div>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>
