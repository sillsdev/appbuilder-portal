<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as m from '$lib/paraglide/messages';
  import { importJSONSchema } from '$lib/projects/common';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { safeParse } from 'valibot';
  import type { PageData } from './$types';

  export let data: PageData;

  let canSubmit = false;
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onUpdate(event) {
      if (event.result.type === 'failure') {
        console.log(event.form.errors.json);
        if (event.result.data.errors) {
          console.log(event.result.data.errors); // TODO: display errors
        }
        event.cancel();
      }
    },
    onUpdated(event) {
      goto('/');
    }
  });

  let reader: FileReader;
  let lastModified = 0;

  onMount(() => {
    reader = new FileReader();

    reader.onloadend = (ev) => {
      const res = safeParse(importJSONSchema, JSON.parse((reader.result as string) ?? ''));
      if (res.success) {
        $form.json = res.output;
        canSubmit = true;
      }
      else {
        console.log(res.issues); // TODO: show errors
      }
    };
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-4">{m.project_importProjects()}</h1>
    <a
      href="https://sil-prd-scriptoria-resources.s3.amazonaws.com/Project+Import.pdf"
      target="_blank"
      class="link pl-4"
    >
      {m.project_importProjectsHelp()}
    </a>
    <div class="flex flex-row gap-4 flex-wrap place-content-center sm:place-content-start p-4">
      <label class="form-control w-full max-w-xs">
        <span class="label-text">{m.project_projectGroup()}:</span>
        <select name="group" id="group" class="select select-bordered" bind:value={$form.group}>
          {#each data.organization?.Groups ?? [] as group}
            <option value={group.Id}>{group.Name}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-full max-w-xs">
        <span class="label-text">{m.project_type()}:</span>
        <select name="type" id="type" class="select select-bordered" bind:value={$form.type}>
          {#each data.types ?? [] as type}
            <option value={type.Id}>{type.Description}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-full max-w-xs">
        <span class="label-text">{m.projectImport_importFile()}:</span>
        <input
          type="file"
          class="file-input file-input-bordered"
          accept="application/json"
          on:change={(e) => {
            if (e.currentTarget?.files?.length) {
              canSubmit = false;
              lastModified = e.currentTarget.files[0].lastModified;
              reader.readAsText(e.currentTarget.files[0]);
            }
          }}
          on:cancel={(e) => {
            if (e.currentTarget?.files?.length) {
              if (e.currentTarget.files[0].lastModified > lastModified) {
                canSubmit = false;
                lastModified = e.currentTarget.files[0].lastModified;
                reader.readAsText(e.currentTarget.files[0]);
              }
            }
          }}
        />
      </label>
    </div>
    <div class="flex flex-wrap place-content-center gap-4 p-4">
      <a href="/projects/own/{$page.params.id}" class="btn w-full max-w-xs">{m.common_cancel()}</a>
      <button class="btn btn-primary w-full max-w-xs" type="submit">{m.common_save()}</button>
    </div>
  </form>
</div>
