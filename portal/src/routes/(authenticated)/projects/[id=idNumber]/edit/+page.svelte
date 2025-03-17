<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
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
        goto('/projects/' + page.params.id);
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1>{m.project_settings_title()}</h1>
    <div class="grid gap-2 gap-x-8 gridcont">
      <div class="w-full flex place-content-between">
        <label for="name">{m.project_projectName()}:</label>
        <input type="text" id="name" class="input input-bordered" bind:value={$form.name} />
      </div>
      <div class="w-full flex place-content-between">
        <label for="owner">{m.project_projectOwner()}</label>
        <select name="owner" id="owner" class="select select-bordered" bind:value={$form.owner}>
          {#each data.owners.toSorted((a, b) => byName(a, b, languageTag())) as owner}
            <option value={owner.Id}>{owner.Name}</option>
          {/each}
        </select>
      </div>
      <div class="w-full flex place-content-between">
        <label for="group">{m.project_projectGroup()}:</label>
        <select name="group" id="group" class="select select-bordered" bind:value={$form.group}>
          {#each data.groups.toSorted((a, b) => byName(a, b, languageTag())) as group}
            <option value={group.Id}>{group.Name}</option>
          {/each}
        </select>
      </div>
      <div class="w-full flex place-content-between">
        <label for="language">{m.project_languageCode()}:</label>
        <!-- <input type="text" id="language" class="input input-bordered" bind:value={$form.language} /> -->
        <LanguageCodeTypeahead bind:langCode={$form.language} dropdownClasses="right-0" />
      </div>
    </div>
    <div class="mt-4">
      <label for="description">
        {m.project_projectDescription()}
        <textarea
          name="description"
          id="description"
          class="textarea textarea-bordered w-full"
          bind:value={$form.description}
        ></textarea>
      </label>
    </div>
    <div class="flex place-content-end space-x-2">
      <a href="/projects/{page.params.id}" class="btn">{m.common_cancel()}</a>
      <button class="btn btn-primary" type="submit">{m.common_save()}</button>
    </div>
  </form>
</div>

<style>
  .gridcont {
    grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
  }
  .gridcont div.flex label {
    margin-right: 0.4rem;
  }
</style>
