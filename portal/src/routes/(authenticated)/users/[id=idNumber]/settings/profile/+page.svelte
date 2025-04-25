<script lang="ts">
  import { page } from '$app/state';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import TypeaheadInput from '$lib/components/TypeaheadInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import { phoneRegex, regExpToInputPattern } from '$lib/valibot';
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
    resetForm: false,
    onSubmit(input) {
      // Set the timezone form value (if the value was changed manually and not clicked)
      if (tzValue && !timeZoneMap.has(tzValue)) input.cancel();
      $form.timezone = timeZoneMap.get(tzValue) ?? null;
    },
    onUpdated({ form }) {
      if (form.valid) {
        toast('success', m.profile_updated());
      }
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
        class="input input-bordered w-full validator"
        bind:value={$form.firstName}
        required
      />
      <span class="validator-hint">{m.org_nameError()}</span>
    </LabeledFormInput>
    <LabeledFormInput name="profile_lastName">
      <input
        type="text"
        name="lastName"
        class="input input-bordered w-full validator"
        bind:value={$form.lastName}
        required
      />
      <span class="validator-hint">{m.org_nameError()}</span>
    </LabeledFormInput>
    <LabeledFormInput name="profile_name">
      <input
        type="text"
        name="displayName"
        class="input input-bordered w-full validator"
        bind:value={$form.displayName}
        required
      />
      <span class="validator-hint">{m.org_nameError()}</span>
    </LabeledFormInput>
    <LabeledFormInput name="profile_email">
      <input
        type="email"
        name="email"
        class="input input-bordered w-full validator"
        bind:value={$form.email}
        required
      />
      <span class="validator-hint">
        {$form.email
          ? m.formErrors_emailInvalid()
          : m.formErrors_emailEmpty()}
      </span>
    </LabeledFormInput>
    <LabeledFormInput name="profile_phone">
      <input
        type="tel"
        name="phone"
        class="input input-bordered w-full validator"
        bind:value={$form.phone}
        pattern={regExpToInputPattern(phoneRegex)}
      />
    </LabeledFormInput>
    <LabeledFormInput name="profile_timezone">
      <TypeaheadInput
        inputElProps={{ placeholder: m.profile_timezonePlaceholder() }}
        getList={(search) => fuzzySearch.search(search).slice(0, 7)}
        onItemClicked={(res) => {
          // Not strictly necessary because it will be set onSubmit but here anyways
          $form.timezone = res.item.key;
          tzValue = res.item.value;
        }}
        bind:search={tzValue}
        classes="w-full {!tzValue || timeZoneMap.has(tzValue) ? '' : 'select-error'}"
        dropdownClasses="w-full bg-base-100"
      >
        {#snippet listElement(res, selected)}
          <div class="w-full right-0" class:selected>
            <span>{res.item.value}</span>
          </div>
        {/snippet}
      </TypeaheadInput>
    </LabeledFormInput>
    <InputWithMessage
      className="mt-4"
      title={{ key: 'profile_notificationSettingsTitle' }}
      message={{ key: 'profile_optOutOfEmailOption' }}
    >
      <input
        type="checkbox"
        name="notifications"
        class="toggle toggle-accent ml-4"
        bind:checked={$form.notifications}
      />
    </InputWithMessage>
    <InputWithMessage
      className="mt-4"
      title={{ key: 'profile_visibleProfile' }}
      message={{ key: 'profile_visibility_visible' }}
    >
      <input
        type="checkbox"
        name="visible"
        class="toggle toggle-accent ml-4"
        bind:checked={$form.visible}
      />
    </InputWithMessage>
    <InputWithMessage className="mt-4" title={{ key: 'users_table_columns_active' }}>
      <input
        type="checkbox"
        name="active"
        class="toggle toggle-accent ml-4"
        disabled={page.data.session?.user.userId === data.subject.Id}
        bind:checked={$form.active}
      />
    </InputWithMessage>
    <div class="flex my-2">
      <button type="submit" class="btn btn-primary">{m.common_save()}</button>
    </div>
  </div>
</form>

<style>
  .selected {
    background-color: var(--color-accent);
  }
</style>
