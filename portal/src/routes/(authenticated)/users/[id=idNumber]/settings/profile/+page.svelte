<script lang="ts">
  import { page } from '$app/stores';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import TypeaheadInput from '$lib/components/TypeaheadInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getTimeZones } from '@vvo/tzdb';
  import Fuse from 'fuse.js';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onSubmit(input) {
      // Set the timezone form value (if the value was changed manually and not clicked)
      if (!timeZoneMap.has(tzValue)) input.cancel();
      $form.timezone = timeZoneMap.get(tzValue)!;
    }
  });

  let tzValue: string = $state('');

  const timeZones = getTimeZones().flatMap((tz) =>
    tz.group
      .map((tzN) => 'GMT ' + tz.rawFormat.split(' - ')[0] + ' ' + tzN)
      .map((v) => ({
        key: tz.name,
        value: v
      }))
  );
  const timeZoneMap = new Map(timeZones.map((v) => [v.value, v.key]));
  const fuzzySearch = new Fuse(timeZones, {
    keys: ['value'],
    isCaseSensitive: false,
    ignoreLocation: true,
    ignoreFieldNorm: true
  });
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col px-4">
    <LabeledFormInput name="profile_firstName">
      <input
        type="text"
        name="firstName"
        class="input input-bordered w-full"
        bind:value={$form.firstName}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_lastName">
      <input
        type="text"
        name="lastName"
        class="input input-bordered w-full"
        bind:value={$form.lastName}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_name">
      <input
        type="text"
        name="displayName"
        class="input input-bordered w-full"
        bind:value={$form.displayName}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_email">
      <input
        type="text"
        name="email"
        class="input input-bordered w-full"
        bind:value={$form.email}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_phone">
      <input
        type="text"
        name="phone"
        class="input input-bordered w-full"
        bind:value={$form.phone}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_timezone">
      <TypeaheadInput
        inputElProps={{ placeholder: m.profile_timezonePlaceholder() }}
        getList={(search) => fuzzySearch.search(search).slice(0, 7)}
        on:itemClicked={(item) => {
          // Not strictly necessary because it will be set onSubmit but here anyways
          $form.timezone = item.detail.item.key;
          tzValue = item.detail.item.value;
        }}
        bind:search={tzValue}
        classes="w-full {!tzValue || timeZoneMap.has(tzValue) ? '' : 'select-error'}"
        dropdownClasses="w-full"
      >
        {#snippet listElement({ item })}
          <div class="w-full right-0">
            <span>{item.item.value}</span>
          </div>
        {/snippet}
      </TypeaheadInput>
    </LabeledFormInput>
    <div class="flex place-content-between items-center mt-4">
      <label for="public" class="w-full">
        <div class="flex flex-col">
          <span class="">
            {m.profile_notificationSettingsTitle()}
          </span>
          <span class="text-sm">
            {m.profile_optOutOfEmailOption()}
          </span>
        </div>
      </label>
      <input
        type="checkbox"
        id="notifications"
        class="toggle toggle-accent ml-4"
        bind:checked={$form.notifications}
      />
    </div>
    <div class="flex place-content-between items-center mt-4">
      <label for="public" class="w-full">
        <div class="flex flex-col">
          <span class="">
            {m.profile_visibleProfile()}
          </span>
          <span class="text-sm">
            {m.profile_visibility_visible()}
          </span>
        </div>
      </label>
      <input
        type="checkbox"
        id="public"
        class="toggle toggle-accent ml-4"
        bind:checked={$form.visible}
      />
    </div>
    <div class="flex place-content-between items-center mt-4">
      <label for="public" class="w-full">
        <div class="flex flex-col">
          <span class="">
            {m.users_table_columns_active()}
          </span>
        </div>
      </label>
      <input
        type="checkbox"
        id="active"
        class="toggle toggle-accent ml-4"
        disabled={$page.data.session?.user.userId === data.form.data.id}
        bind:checked={$form.active}
      />
    </div>
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>
