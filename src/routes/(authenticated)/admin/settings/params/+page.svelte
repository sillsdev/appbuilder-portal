<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';
  import JSONEditor from '$lib/components/settings/JSONEditor.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { SiteParams } from '$lib/site-params';
  import { toast } from '$lib/utils';
  import { getTimeDateString } from '$lib/utils/time';
  import { SiteParamSchemas, siteParamsJSONSchema } from '$lib/valibot';

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

      invalidate('admin-settings:params');
    }
  });

  let ok = $state(data.settings.map((s) => true));
</script>

<h3 class="pl-4">{m.admin_nav_params()}</h3>

<form class="m-4" method="post" action="" use:enhance>
  {#each data.settings as setting, i}
    {@const user = setting.ModifiedBy}
    {@const key = setting.Key as SiteParams}
    {@const validKeys = Object.keys(SiteParamSchemas[key]?.entries ?? {}).join(', ')}
    <LabeledFormInput
      key="common_passThrough"
      params={{
        value: `${key}: ${user ? (user.Name ?? `User #${setting.ModifiedById}`) : m.appName()} (${getTimeDateString(setting.DateUpdated)})`
      }}
    >
      <JSONEditor
        name="properties"
        class="w-full"
        bind:value={$form.params[i].Value}
        bind:ok={ok[i]}
        schema={siteParamsJSONSchema(key)}
        hint={validKeys
          ? {
              key: 'common_passThrough',
              params: {
                value: `Valid keys: ${validKeys}`
              }
            }
          : undefined}
      />
      <span class="validator-hint">&nbsp;</span>
    </LabeledFormInput>
  {/each}

  <div class="my-4">
    <SubmitButton disabled={!ok.every((f) => f)} />
  </div>
</form>
