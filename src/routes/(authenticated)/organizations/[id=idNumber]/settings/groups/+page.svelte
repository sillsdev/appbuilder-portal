<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let groups = $state(data.groups);

  const { form, enhance } = superForm(data.form, {
    resetForm: true,
    onUpdate({ form, result, formElement }) {
      if (form.valid && result.type === 'success') {
        toast('success', m.org_groupCreated());
        groups.push({
          Id: result.data.createdId,
          Name: form.data.name,
          Abbreviation: form.data.abbreviation,
          OwnerId: data.organization.Id
        });
        formElement.reset();
      } else {
        toast('error', m.errors_generic({ errorMessage: '' }));
      }
    }
  });
</script>

{#each groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
  <form
    action="?/deleteGroup"
    class="m-2"
    method="post"
    use:svk_enhance={() => {
      return async ({ result }) => {
        if (result.type === 'success') {
          const data = result.data as ActionData;
          if (data?.ok) {
            toast('success', m.org_groupDeleted());
            groups = groups.filter((g) => g.Id !== group.Id);
          } else if (data?.form.valid) {
            toast('error', m.org_groupHasProjects({ group: group.Name ?? '' }));
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
          }
        }
      };
    }}
  >
    <input type="hidden" name="id" value={group.Id} />
    <div class="border w-full flex flex-row p-2 rounded-md items-center place-content-between">
      <div>
        <span class="p-1 badge badge-primary rounded-md">{group.Abbreviation}</span>
        <span class="p-1">{group.Name}</span>
      </div>
      <button class="btn btn-xs btn-ghost p-0" type="submit">
        <IconContainer icon="mdi:close" class="" width={26} />
      </button>
    </div>
  </form>
{/each}
<form
  action="?/addGroup"
  class="m-2 fieldset border border-black/20 dark:border-gray-50/20 rounded-lg p-2"
  method="post"
  use:enhance
  onreset={(e) => {
    for (const el of e.currentTarget.elements) {
      if (el instanceof HTMLInputElement) {
        el.setCustomValidity('');
      }
    }
  }}
>
  <div class="fieldset-legend">{m.org_addGroupButton()}</div>
  <div class="flex flex-col sm:flex-row w-full sm:space-x-2 items-center">
    <LabeledFormInput key="common_name">
      <input
        class="w-full input input-bordered validator"
        type="text"
        name="name"
        bind:value={$form.name}
        required
      />
      <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
    </LabeledFormInput>
    <LabeledFormInput key="common_abbreviation">
      <input
        class="w-full input input-bordered validator"
        type="text"
        name="abbreviation"
        bind:value={$form.abbreviation}
        required
      />
      <span class="validator-hint">{m.org_abbreviationError()}</span>
    </LabeledFormInput>
    <input type="submit" class="btn btn-primary w-full sm:w-auto" value={m.common_save()} />
  </div>
</form>
