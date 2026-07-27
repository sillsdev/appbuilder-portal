<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import JSONEditor from '$lib/components/settings/JSONEditor.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';
  import { siteParamsSchema } from '$lib/valibot';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        toast('success', m.updated());
      }
    }
  });

  let ok = $state(data.settings.map((s) => true));
</script>

<h3 class="pl-4">{m.admin_nav_params()}</h3>

<form class="m-4" method="post" action="" use:enhance>
  {#each data.settings.toSorted((a, b) => byString(a.Key, b.Key, getLocale())) as setting, i}
    {@const user = setting.ModifiedBy}
    <LabeledFormInput
      key="common_passThrough"
      params={{
        value: `${setting.Key}: ${user ? (user.Name ?? `User #${setting.ModifiedById}`) : m.appName()} (${getTimeDateString(setting.DateUpdated)})`
      }}
    >
      <JSONEditor
        name="properties"
        class="w-full"
        bind:value={$form[setting.Key]}
        bind:ok={ok[i]}
        schema={siteParamsSchema}
      />
      <span class="validator-hint">&nbsp;</span>
    </LabeledFormInput>
  {/each}

  <div class="my-4">
    <SubmitButton disabled={!ok.every((f) => f)} />
  </div>
</form>
