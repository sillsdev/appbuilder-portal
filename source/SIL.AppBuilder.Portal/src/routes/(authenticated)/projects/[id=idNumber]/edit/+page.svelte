<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { langtagRegex } from '$lib/projects';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(`/projects/${page.params.id}`));
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1>{m.project_settings_title()}</h1>
    <div class="flex flex-col gap-2 items-center">
      <div class="row">
        <LabeledFormInput name="project_projectName" className="md:max-w-xs grow">
          <input
            type="text"
            name="name"
            class="input input-bordered validator"
            bind:value={$form.name}
            required
          />
          <span class="validator-hint">{m.project_side_reviewers_form_nameError()}</span>
        </LabeledFormInput>
        <LabeledFormInput name="project_projectOwner" className="md:max-w-xs">
          <select name="owner" class="select select-bordered" bind:value={$form.owner}>
            {#each data.owners.toSorted((a, b) => byName(a, b, getLocale())) as owner}
              <option value={owner.Id}>{owner.Name}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput name="project_projectGroup" className="md:max-w-xs grow">
          <select name="group" class="select select-bordered" bind:value={$form.group}>
            {#each data.groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
              <option value={group.Id}>{group.Name}</option>
            {/each}
          </select>
        </LabeledFormInput>
        <LabeledFormInput name="project_languageCode" className="md:max-w-xs">
          <LanguageCodeTypeahead
            bind:langCode={$form.language}
            inputClasses="w-full md:max-w-xs validator"
            dropdownClasses="left-0"
            inputElProps={{ required: true, pattern: langtagRegex.toString().slice(1, -1) }}
          >
            {#snippet validatorHint()}
              <span class="validator-hint">Invalid BCP 47 Language Tag</span>
            {/snippet}
          </LanguageCodeTypeahead>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput name="project_projectDescription" className="w-full max-w-2xl">
          <textarea
            name="description"
            class="textarea textarea-bordered h-48 w-full"
            bind:value={$form.description}
          ></textarea>
        </LabeledFormInput>
      </div>
      <div class="flex flex-row flex-wrap place-content-center gap-4 p-4 w-full">
        <a
          href={localizeHref(`/projects/${page.params.id}`)}
          class="btn btn-secondary w-full max-w-xs"
        >
          {m.common_cancel()}
        </a>
        <input
          class="btn btn-primary w-full max-w-xs"
          class:btn-disabled={!($form.name.length && $form.language.length)}
          type="submit"
          value={m.common_save()}
        />
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
