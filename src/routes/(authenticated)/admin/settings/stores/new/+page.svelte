<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons, getStoreIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { StoreType } from '$lib/prisma';
  import { toast } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/stores';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.models_createSuccess({ name: m.stores_name() }));
      }
    }
  });

  const mobileSizing = 'w-full md:max-w-xs';
</script>

<h3 class="pl-4">{m.models_add({ name: m.stores_name() })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="projectTable_owner">
    <SelectWithIcon
      bind:value={$form.owner}
      items={data.organizations}
      attr={{ name: 'owner' }}
      icon={Icons.Organization}
    >
      {#snippet extra()}
        <option value={null}>{m.appName()}</option>
      {/snippet}
    </SelectWithIcon>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput
    key="stores_publisherId"
    input={{
      name: 'publisherId',
      required: true,
      err: m.stores_publisherIdEmpty(),
      icon: Icons.Publish
    }}
    bind:value={$form.publisherId}
    class="md:max-w-xs"
  />
  <LabeledFormInput key="common_type">
    <SelectWithIcon
      bind:value={$form.storeType}
      items={data.options.storeType
        .toSorted((a, b) => byString(a.Description, b.Description, getLocale()))
        .map((st) => ({ ...st, Name: st.Description ?? st.Name, icon: getStoreIcon(st.Id) }))}
      class="validator {mobileSizing}"
      attr={{ name: 'storeType', required: true }}
    />
    <span class="validator-hint">{m.stores_emptyStoreType()}</span>
  </LabeledFormInput>
  {#if $form.storeType === StoreType.GooglePlay}
    <LabeledFormInput
      key="stores_gpTitle"
      input={{
        name: 'gpTitle',
        required: $form.owner === null,
        err: m.stores_gpTitleEmpty(),
        icon: Icons.GooglePlay
      }}
      bind:value={$form.gpTitle}
      class="md:max-w-xs"
    />
  {/if}
  <LabeledFormInput
    key="common_description"
    input={{
      name: 'description',
      icon: Icons.Name
    }}
    bind:value={$form.description}
    class="md:max-w-xs"
  />
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon={Icons.AddStore} />
  </div>
</form>
