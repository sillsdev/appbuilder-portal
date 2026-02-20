<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { byString } from '$lib/utils/sorting';
  import { langtagRegex, regExpToInputPattern } from '$lib/valibot';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onSubmit(event) {
      if (!($form.Name.length && $form.Language.length)) {
        event.cancel();
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });

  onMount(() => {
    setOrgFromParams($orgActive, page.params.id);
  });

  $effect(() => {
    if (!selectGotoFromOrg(!!$orgActive, `/projects/new/${$orgActive}`, `/projects/new`)) {
      setOrgFromParams($orgActive, page.params.id);
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-2">{m.project_newProject()}</h1>
    <div class="flex flex-col gap-2 items-center">
      <div class="row">
        <LabeledFormInput
          key="project_name"
          class="md:max-w-xs grow"
          input={{
            name: 'name',
            err: m.formErrors_nameEmpty(),
            icon: Icons.Name,
            required: true
          }}
          bind:value={$form.Name}
        />
        <LabeledFormInput key="project_group" class="md:max-w-xs">
          <SelectWithIcon
            attr={{ name: 'group' }}
            bind:value={$form.group}
            items={data.organization.Groups}
            icon={Icons.Group}
            class="w-full"
          />
          <span class="validator-hint">&nbsp;</span>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="project_languageCode" class="md:max-w-xs">
          <LanguageCodeTypeahead
            bind:langCode={$form.Language}
            class={{
              dropdown: 'left-0',
              input: 'w-full md:max-w-xs validator'
            }}
            inputElProps={{ required: true, pattern: regExpToInputPattern(langtagRegex) }}
          >
            {#snippet validatorHint()}
              <span class="validator-hint">Invalid BCP 47 Language Tag</span>
            {/snippet}
          </LanguageCodeTypeahead>
        </LabeledFormInput>
        <LabeledFormInput key="common_type" class="md:max-w-xs">
          <select name="type" class="select" bind:value={$form.type}>
            {#each data.types.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as type}
              <option value={type.Id}>{type.Description}</option>
            {/each}
          </select>
          <span class="validator-hint">&nbsp;</span>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="common_description" class="max-w-2xl">
          <textarea
            name="Description"
            class="textarea h-48 w-full"
            bind:value={$form.Description}
          ></textarea>
          <span class="validator-hint">&nbsp;</span>
        </LabeledFormInput>
      </div>
      <div class="row">
        <Toggle
          title={{ key: 'project_public' }}
          message={{ key: 'project_visibilityDescription' }}
          class="py-2 max-w-2xl"
          name="IsPublic"
          inputAttr={{ onchange: () => {} }}
          bind:checked={$form.IsPublic}
          onIcon={Icons.Visible}
          offIcon={Icons.Invisible}
        />
      </div>
      <div class="flex flex-row flex-wrap place-content-center gap-4 p-4 w-full">
        <CancelButton
          returnTo={localizeHref(`/projects/own/${page.params.id}`)}
          class="w-full max-w-xs"
        />
        <BlockIfJobsUnavailable class="btn btn-primary w-full max-w-xs">
          {#snippet altContent()}
            <IconContainer icon={Icons.AddProject} width={20} />
            {m.common_save()}
          {/snippet}
          <SubmitButton
            class="w-full max-w-xs"
            disabled={!($form.Name.length && $form.Language.length)}
          >
            {@render altContent()}
          </SubmitButton>
        </BlockIfJobsUnavailable>
      </div>
    </div>
  </form>
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 2);
    column-gap: calc(var(--spacing) * 8);
    width: 100%;
    justify-content: center;
  }

  select {
    width: 100%;
  }
</style>
