<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    resetForm: false,
    dataType: 'json',
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
      <Toggle
        title={{ key: 'org_useDefaultBuildEngine' }}
        class="py-2"
        name="useDefaultBuildEngine"
        bind:checked={$form.useDefaultBuildEngine}
        onIcon="pepicons-pop:gear"
        offIcon="pepicons-pop:gear-off"
      />
      {#if !$form.useDefaultBuildEngine}
        <LabeledFormInput
          key="org_buildEngineURL"
          input={{
            type: 'url',
            name: 'buildEngineUrl',
            required: !$form.useDefaultBuildEngine,
            err: m.org_emptyBuildEngineURL(),
            icon: 'solar:link-bold'
          }}
          bind:value={$form.buildEngineUrl}
        />
        <LabeledFormInput
          key="org_accessToken"
          input={{
            name: 'buildEngineApiAccessToken',
            required: !$form.useDefaultBuildEngine,
            err: m.org_emptyAccessToken(),
            icon: 'material-symbols:key'
          }}
          bind:value={$form.buildEngineApiAccessToken}
        />
      {/if}
    </div>
  </div>
  <div class="my-4">
    <SubmitButton />
  </div>
</form>
