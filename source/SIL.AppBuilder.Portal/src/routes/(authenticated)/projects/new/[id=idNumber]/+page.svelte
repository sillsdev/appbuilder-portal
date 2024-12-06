<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto('/projects/' + $page.params.id);
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-2">{m.project_newProject()}</h1>
    <div class="grid gap-2 gap-x-4 gridcont">
      <label class="form-control">
        <span class="label-text">{m.project_projectName()}:</span>
        <input type="text" id="name" class="input input-bordered" bind:value={$form.Name} />
      </label>
      <label class="form-control">
        <span class="label-text">{m.project_projectGroup()}:</span>
        <select name="group" id="group" class="select select-bordered" bind:value={$form.group}>
          {#each data.organization?.Groups ?? [] as group}
            <option value={group.Id}>{group.Name}</option>
          {/each}
        </select>
      </label>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="form-control">
        <span class="label-text">{m.project_languageCode()}:</span>
        <!-- <input type="text" id="language" class="input input-bordered" bind:value={$form.language} /> -->
        <LanguageCodeTypeahead bind:langCode={$form.Language} inputClasses="w-full md:max-w-xs" dropdownClasses="left-0" />
      </label>
      <label class="form-control">
        <span class="label-text">{m.project_type()}:</span>
        <select name="type" id="type" class="select select-bordered" bind:value={$form.type}>
          {#each data.types ?? [] as type}
            <option value={type.Id}>{type.Description}</option>
          {/each}
        </select>
      </label>
      <label class="form-control">
        <span class="label-text">{m.project_projectDescription()}:</span>
        <textarea
          name="description"
          id="description"
          class="textarea textarea-bordered w-full"
          bind:value={$form.Description}
        />
      </label>
      <div class="form-control">
        <label for="public" class="label">
          {m.project_public()}:
          <input
            type="checkbox"
            name="public"
            id="public"
            class="toggle"
            bind:checked={$form.IsPublic}
          />
        </label>
        <p>{m.project_visibilityDescription()}</p>
      </div>
    </div>
    <div class="flex flex-wrap place-content-center gap-4 p-4">
      <a href="/projects/own/{$page.params.id}" class="btn w-full max-w-xs">{m.common_cancel()}</a>
      <button class="btn btn-primary w-full max-w-xs" type="submit">{m.common_save()}</button>
    </div>
  </form>
</div>

<style lang="postcss">
  .gridcont {
    grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
  }
  .gridcont div.flex label {
    margin-right: 0.4rem;
  }
  .label[for='public'] {
    padding-left: 0px;
  }
  .form-control {
    @apply w-full;
  }
  @media screen(md) {
    .form-control {
      @apply max-w-xs;
    }
  }
</style>
