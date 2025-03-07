<script lang="ts">
  import { page } from '$app/state';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
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
        <label class="form-control grow">
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
      </div>
      <div class="row">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="form-control">
          <span class="label-text">{m.project_languageCode()}:</span>
          <!-- <input type="text" id="language" class="input input-bordered" bind:value={$form.language} /> -->
          <LanguageCodeTypeahead
            bind:langCode={$form.Language}
            inputClasses="w-full md:max-w-xs"
            dropdownClasses="left-0"
          />
        </label>
        <label class="form-control">
          <span class="label-text">{m.project_type()}:</span>
          <select name="type" id="type" class="select select-bordered" bind:value={$form.type}>
            {#each data.types ?? [] as type}
              <option value={type.Id}>{type.Description}</option>
            {/each}
          </select>
        </label>
      </div>
      <div class="row">
        <label class="form-control">
          <span class="label-text">{m.project_projectDescription()}:</span>
          <textarea
            name="description"
            id="description"
            class="textarea textarea-bordered w-full"
            bind:value={$form.Description}
></textarea>
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
      <a href="/projects/own/{page.params.id}" class="btn w-full max-w-xs">{m.common_cancel()}</a>
      <button
        class="btn btn-primary w-full max-w-xs"
        class:btn-disabled={!($form.Name.length && $form.Language.length)}
        type="submit"
      >
        {m.common_save()}
      </button>
    </div>
  </form>
</div>

<style lang="postcss">
  .label[for='public'] {
    padding-left: 0px;
  }
  .row {
    @apply flex flex-row flex-wrap gap-2 gap-x-4 w-full justify-center;
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
