<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { importJSONSchema } from '$lib/projects/common';
  import { byName, byString } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import { flatten, safeParse } from 'valibot';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let returnedErrors: {
    path: string;
    messages: string[];
  }[] = $state([]);
  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onUpdate(event) {
      if (event.result.type === 'failure') {
        event.cancel();
        const data = event.result.data as FormResult<{
          errors: {
            path: string;
            messages: string[];
          }[];
        }>;
        returnedErrors = data.errors;
      }
    }
  });

  let reader: FileReader;

  // set to null *only* if the file has been parsed *and* there are no errors
  let parseErrors: ReturnType<typeof flatten<typeof importJSONSchema>> | null = $state({});

  let canSubmit = $derived(!$allErrors.length && !parseErrors && !returnedErrors.length);

  onMount(() => {
    reader = new FileReader();

    reader.onloadend = (ev) => {
      try {
        const res = safeParse(importJSONSchema, JSON.parse((reader.result as string) ?? ''));
        returnedErrors = [];
        if (res.success) {
          $form.json = res.output;
          parseErrors = null;
        } else {
          parseErrors = flatten<typeof importJSONSchema>(res.issues);
        }
      } catch (e) {
        //@ts-expect-error I just want to add the error!
        parseErrors = { root: [e] };
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
          {#each data.organization.Groups.toSorted((a, b) => byName(a, b, languageTag())) as group}
            <option value={group.Id}>{group.Name}</option>
          {/each}
        </select>
      </label>
      <label class="form-control w-full max-w-xs">
        <span class="label-text">{m.project_type()}:</span>
        <select name="type" id="type" class="select select-bordered" bind:value={$form.type}>
          {#each data.types.toSorted( (a, b) => byString(a.Description, b.Description, languageTag()) ) as type}
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
          onchange={(e) => {
            if (e.currentTarget?.files?.length) {
              parseErrors = {};
              reader.readAsText(e.currentTarget.files[0]);
            }
          }}
          oncancel={(e) => {
            if (e.currentTarget?.files?.length) {
              parseErrors = {};
              reader.readAsText(e.currentTarget.files[0]);
            }
          }}
        />
      </label>
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
    {#if returnedErrors.length}
      <ul>
        {#each returnedErrors as error}
          <li class="text-red-500">
            <b>{error.path}:</b>
            {error.messages.join('. ')}
          </li>
        {/each}
      </ul>
    {/if}
    {#if parseErrors}
      <ul>
        {#each parseErrors.root ?? [] as error}
          <li class="text-red-500">
            <b>{error}</b>
          </li>
        {/each}
        {#if parseErrors.nested}
          {#each Object.entries(parseErrors.nested) as error}
            <li class="text-red-500">
              <b>{error[0]}:</b>
              {error[1]?.join('. ')}
            </li>
          {/each}
        {/if}
        {#each parseErrors.other ?? [] as error}
          <li class="text-red-500">
            <b>{error}</b>
          </li>
        {/each}
      </ul>
    {/if}
    <div class="flex flex-wrap place-content-center gap-4 p-4">
      <a href="/projects/own/{page.params.id}" class="btn w-full max-w-xs">{m.common_cancel()}</a>
      <button class="btn btn-primary w-full max-w-xs" disabled={!canSubmit} type="submit">
        {m.common_save()}
      </button>
    </div>
  </form>
</div>
