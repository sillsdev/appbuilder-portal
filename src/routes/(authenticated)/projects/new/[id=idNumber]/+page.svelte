<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PublicPrivateToggle from '$lib/components/settings/PublicPrivateToggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';
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
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-2">{m.project_newProject()}</h1>
    <div class="flex flex-col gap-2 items-center">
      <div class="row">
        <LabeledFormInput key="project_name" classes="md:max-w-xs grow">
          <input
            type="text"
            name="Name"
            class="input input-bordered validator"
            bind:value={$form.Name}
            required
          />
          <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
        </LabeledFormInput>
        <LabeledFormInput key="project_group" classes="md:max-w-xs">
          <select name="group" class="select select-bordered" bind:value={$form.group}>
            {#each data.organization.Groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
              <option value={group.Id}>{group.Name}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="project_languageCode" classes="md:max-w-xs">
          <LanguageCodeTypeahead
            bind:langCode={$form.Language}
            inputClasses="w-full md:max-w-xs validator"
            dropdownClasses="left-0"
            inputElProps={{ required: true, pattern: regExpToInputPattern(langtagRegex) }}
          >
            {#snippet validatorHint()}
              <span class="validator-hint">Invalid BCP 47 Language Tag</span>
            {/snippet}
          </LanguageCodeTypeahead>
        </LabeledFormInput>
        <LabeledFormInput key="project_type" classes="md:max-w-xs">
          <select name="type" class="select select-bordered" bind:value={$form.type}>
            {#each data.types.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as type}
              <option value={type.Id}>{type.Description}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="project_description" classes="md:max-w-xs">
          <textarea
            name="Description"
            class="textarea textarea-bordered h-48 w-full"
            bind:value={$form.Description}
          ></textarea>
        </LabeledFormInput>
        <PublicPrivateToggle
          title={{ key: 'project_public' }}
          message={{ key: 'project_visibilityDescription' }}
          className="py-2 md:max-w-xs"
          formName="IsPublic"
          bind:checked={$form.IsPublic}
        />
      </div>
      <div class="flex flex-row flex-wrap place-content-center gap-4 p-4 w-full">
        <a
          href={localizeHref(`/projects/own/${page.params.id}`)}
          class="btn btn-secondary w-full max-w-xs"
        >
          {m.common_cancel()}
        </a>
        <BlockIfJobsUnavailable className="btn btn-primary w-full max-w-xs">
          {#snippet altContent()}
            {m.common_save()}
          {/snippet}
          <button
            class="btn btn-primary w-full max-w-xs"
            disabled={!($form.Name.length && $form.Language.length)}
            type="submit"
          >
            {@render altContent()}
          </button>
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
    column-gap: calc(var(--spacing) * 4);
    width: 100%;
    justify-content: center;
  }
</style>
