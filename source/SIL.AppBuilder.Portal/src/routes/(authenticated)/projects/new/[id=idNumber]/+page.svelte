<script lang="ts">
  import { page } from '$app/state';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName, byString } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    onSubmit(event) {
      if (!($form.Name.length && $form.Language.length)) {
        event.cancel();
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-2">{m.project_newProject()}</h1>
    <div class="flex flex-col gap-2 items-center">
      <div class="row">
        <LabeledFormInput name="project_projectName" className="md:max-w-xs grow">
          <input type="text" id="name" class="input input-bordered" bind:value={$form.Name} />
        </LabeledFormInput>
        <LabeledFormInput name="project_projectGroup" className="md:max-w-xs">
          <select name="group" id="group" class="select select-bordered" bind:value={$form.group}>
            {#each data.organization.Groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
              <option value={group.Id}>{group.Name}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput name="project_languageCode" className="md:max-w-xs">
          <LanguageCodeTypeahead
            bind:langCode={$form.Language}
            inputClasses="w-full md:max-w-xs"
            dropdownClasses="left-0"
          />
        </LabeledFormInput>
        <LabeledFormInput name="project_type" className="md:max-w-xs">
          <select name="type" id="type" class="select select-bordered" bind:value={$form.type}>
            {#each data.types.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as type}
              <option value={type.Id}>{type.Description}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput name="project_projectDescription" className="md:max-w-xs">
          <textarea
            name="description"
            id="description"
            class="textarea textarea-bordered w-full"
            bind:value={$form.Description}
          ></textarea>
        </LabeledFormInput>
        <LabeledFormInput name="project_public" className="md:max-w-xs">
          <InputWithMessage name="project_visibilityDescription">
            <input
              type="checkbox"
              name="public"
              id="public"
              class="toggle"
              bind:checked={$form.IsPublic}
            />
          </InputWithMessage>
        </LabeledFormInput>
      </div>
      {#if $allErrors.length}
        <ul>
          {#each $allErrors as error}
            <li class="text-red-500">
              <b>{error.path}:</b>
              {error.messages.join('. ')}
            </li>
          {/each}
        </ul>
      {/if}
      <div class="flex flex-wrap place-content-center gap-4 p-4">
        <a href={localizeHref(`/projects/own/${page.params.id}`)} class="btn w-full max-w-xs">
          {m.common_cancel()}
        </a>
        <button
          class="btn btn-primary w-full max-w-xs"
          class:btn-disabled={!($form.Name.length && $form.Language.length)}
          type="submit"
        >
          {m.common_save()}
        </button>
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
