<script lang="ts">
  import { onMount } from 'svelte';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import { flatten, safeParse } from 'valibot';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { importJSONSchema } from '$lib/projects';
  import { toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let returnedErrors: {
    path: string;
    messages: string[];
  }[] = $state([]);
  const { form, enhance } = superForm(data.form, {
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
    },
    onUpdated({ form }) {
      if (form.valid) {
        toast('success', m.projectImport_success());
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });

  let reader: FileReader;

  // set to null *only* if the file has been parsed *and* there are no errors
  let parseErrors: ReturnType<typeof flatten<typeof importJSONSchema>> | null = $state({});

  let canSubmit = $derived(!parseErrors && !returnedErrors.length);

  onMount(() => {
    reader = new FileReader();

    reader.onloadend = (ev) => {
      const res = safeParse(importJSONSchema, reader.result?.toString());
      returnedErrors = [];
      if (res.success) {
        $form.json = JSON.stringify(res.output);
        parseErrors = null;
      } else {
        parseErrors = flatten<typeof importJSONSchema>(res.issues);
      }
    };
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1 class="pl-4">{m.projectImport_title()}</h1>
    <a
      href="https://sil-prd-scriptoria-resources.s3.amazonaws.com/Project+Import.pdf"
      target="_blank"
      class="link pl-4"
    >
      {m.projectImport_help()}
    </a>
    <div class="flex flex-row gap-4 flex-wrap place-content-center sm:place-content-start p-4">
      <LabeledFormInput key="project_group" classes="max-w-xs">
        <select name="group" class="select select-bordered" bind:value={$form.group}>
          {#each data.organization.Groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
            <option value={group.Id}>{group.Name}</option>
          {/each}
        </select>
      </LabeledFormInput>
      <LabeledFormInput key="project_type" classes="max-w-xs">
        <select name="type" class="select select-bordered" bind:value={$form.type}>
          {#each data.types.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as type}
            <option value={type.Id}>{type.Description}</option>
          {/each}
        </select>
      </LabeledFormInput>
      <LabeledFormInput key="projectImport_file" classes="max-w-xs">
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
      </LabeledFormInput>
    </div>
    {#if returnedErrors.length}
      <ul>
        {#each returnedErrors as error}
          <li class="text-error">
            <b>{error.path}:</b>
            {error.messages.join('. ')}
          </li>
        {/each}
      </ul>
    {/if}
    {#if parseErrors}
      <ul>
        {#each parseErrors.root ?? [] as error}
          <li class="text-error">
            {error}
          </li>
        {/each}
        {#if parseErrors.nested}
          {#each Object.entries(parseErrors.nested) as entry}
            {@const errLoc = entry[0]}
            {@const errors = (entry[1] as string[])?.join('. ')}
            <li class="text-error">
              <b>{errLoc}:</b>
              {errors}
            </li>
          {/each}
        {/if}
        {#each parseErrors.other ?? [] as error}
          <li class="text-error">
            {error}
          </li>
        {/each}
      </ul>
    {/if}
    <div class="flex flex-wrap place-content-center gap-4 p-4">
      <a
        href={localizeHref(`/projects/own/${page.params.id}`)}
        class="btn btn-secondary w-full max-w-xs"
      >
        {m.common_cancel()}
      </a>
      {#if data.jobsAvailable}
        <button class="btn btn-primary w-full max-w-xs" disabled={!canSubmit} type="submit">
          {m.common_save()}
        </button>
      {:else}
        <button
          class="btn btn-primary w-full max-w-xs opacity-30 cursor-not-allowed"
          onclick={() => toast('warning', m.system_unavailable())}
          type="button"
        >
          {m.common_save()}
        </button>
      {/if}
    </div>
  </form>
</div>
