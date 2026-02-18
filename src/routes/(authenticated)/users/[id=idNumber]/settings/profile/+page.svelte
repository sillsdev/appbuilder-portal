<script lang="ts">
  import Icon from '@iconify/svelte';
  import { getTimeZones } from '@vvo/tzdb';
  import Fuse from 'fuse.js';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import TypeaheadInput from '$lib/components/TypeaheadInput.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { RoleId } from '$lib/prisma';
  import { NotificationType } from '$lib/users';
  import { enumNumVals, toast } from '$lib/utils';
  import { isAdminForAny, isSuperAdmin } from '$lib/utils/roles';
  import { phoneRegex, regExpToInputPattern } from '$lib/valibot';

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

  const subjectRoles = $derived(
    data.subjectOrgs.flatMap((o) => o.UserRoles.map((ur) => [o.Id, ur.RoleId] as [number, RoleId]))
  );

  const emailOptions = $derived(
    enumNumVals(NotificationType).filter((o) => {
      switch (o) {
        case NotificationType.AdminJobFailed:
          return isAdminForAny(subjectRoles);
        case NotificationType.SuperAdminLowPriority:
          return isSuperAdmin(subjectRoles) && isSuperAdmin(data.session.user.roles);
        default:
          return true;
      }
    })
  );
</script>

<form action="" method="post" use:enhance>
  <div class="flex flex-col px-4">
    <LabeledFormInput key="profile_firstName">
      <input
        type="text"
        name="firstName"
        class="input input-bordered w-full validator"
        bind:value={$form.firstName}
        required
      />
      <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
    </LabeledFormInput>
    <LabeledFormInput key="profile_lastName">
      <input
        type="text"
        name="lastName"
        class="input input-bordered w-full validator"
        bind:value={$form.lastName}
        required
      />
      <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
    </LabeledFormInput>
    <LabeledFormInput key="profile_name">
      <div class="input input-bordered w-full validator">
        <IconContainer icon="mdi:user" width={24} class="cursor-pointer" />
        <input type="text" name="displayName" bind:value={$form.displayName} required />
      </div>
      <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
    </LabeledFormInput>
    <LabeledFormInput key="profile_email">
      <div class="input input-bordered w-full validator">
        <IconContainer icon="ic:baseline-email" width={24} class="cursor-pointer" />
        <input type="email" name="email" bind:value={$form.email} required />
      </div>
      <span class="validator-hint">
        {$form.email ? m.formErrors_emailInvalid() : m.formErrors_emailEmpty()}
      </span>
    </LabeledFormInput>
    <LabeledFormInput key="profile_phone">
      <div class="input input-bordered w-full validator">
        <IconContainer icon="ic:baseline-phone" width={24} class="cursor-pointer" />
        <input
          type="tel"
          name="phone"
          bind:value={$form.phone}
          pattern={regExpToInputPattern(phoneRegex)}
        />
      </div>
      <span class="validator-hint">&nbsp;</span>
    </LabeledFormInput>
    <LabeledFormInput key="profile_timezone">
      <TypeaheadInput
        inputElProps={{ placeholder: m.profile_timezonePlaceholder() }}
        getList={(search) => fuzzySearch.search(search).slice(0, 7)}
        onItemClicked={(res) => {
          // Not strictly necessary because it will be set onSubmit but here anyways
          $form.timezone = res.item.key;
          tzValue = res.item.value;
        }}
        bind:search={tzValue}
        class={{
          default: ['w-full', tzValue && !timeZoneMap.has(tzValue) && 'select-error'],
          dropdown: 'w-full bg-base-100'
        }}
        icon="mdi:timezone"
      >
        {#snippet listElement(res, selected)}
          <div class="w-full right-0" class:selected>
            <span>{res.item.value}</span>
          </div>
        {/snippet}
      </TypeaheadInput>
    </LabeledFormInput>
    <Toggle
      class="mt-4"
      title={{ key: 'profile_notificationSettingsTitle' }}
      message={{ key: 'profile_optOutOfEmailOption' }}
      bind:checked={$form.notifications}
      name="notifications"
      onIcon="iconamoon:notification-fill"
      offIcon="iconamoon:notification-off"
    />
    {#if !$form.notifications}
      <LabeledFormInput
        key="profile_emailExceptions"
        class="border border-info p-1 my-4 rounded-lg"
      >
        {#each emailOptions as option}
          <InputWithMessage
            message={{ key: 'profile_email_options', params: { option } }}
            class="my-1"
          >
            <div
              class={['toggle toggle-info', $form.emailOptions.includes(option) && 'border-info']}
            >
              <input
                class="checked:bg-info checked:border-info rounded-full"
                type="checkbox"
                bind:group={$form.emailOptions}
                value={option}
              />
              <Icon icon="iconamoon:notification-off" width={20} height={20} />
              <Icon icon="iconamoon:notification-fill" width={20} height={20} color="white" />
            </div>
          </InputWithMessage>
        {/each}
      </LabeledFormInput>
    {/if}
    <Toggle
      class="mt-4"
      title={{ key: 'profile_visibleProfile' }}
      message={{ key: 'profile_visibility_visible' }}
      bind:checked={$form.visible}
      name="visible"
      onIcon="mdi:eye"
      offIcon="mdi:eye-off-outline"
    />
    <Toggle
      class="mt-4"
      title={{ key: 'users_table_active' }}
      name="active"
      inputAttr={{ disabled: page.data.session?.user.userId === data.subject.Id }}
      bind:checked={$form.active}
      onIcon="mdi:lock-open-variant"
      offIcon="mdi:lock"
    />
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
