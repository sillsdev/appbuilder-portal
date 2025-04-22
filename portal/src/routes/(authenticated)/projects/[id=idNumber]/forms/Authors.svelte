<script lang="ts">
  import { enhance as svk_enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
  import type { AuthorSchema } from './valibot';

  interface Props {
    group: { Name: string | null };
    projectAuthors: {
      Id: number;
      Users: {
        Id: number;
        Name: string | null;
      };
    }[];
    availableAuthors: {
      Id: number;
      Name: string | null;
    }[];
    formData: SuperValidated<Infer<AuthorSchema>>;
  }

  let { projectAuthors, availableAuthors, formData }: Props = $props();

  const { form, enhance } = superForm(formData);
</script>

<div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
  <div class="bg-neutral">
    <h2>{m.project_side_authors_title()}</h2>
  </div>
  <div class="p-2">
    {#if projectAuthors.length}
      {@const locale = getLocale()}
      {#each projectAuthors.toSorted((a, b) => byName(a.Users, b.Users, locale)) as author}
        <div class="flex flex-row w-full place-content-between p-2">
          <span>{author.Users.Name}</span>
          <form action="?/deleteAuthor" method="post" use:svk_enhance>
            <input type="hidden" name="id" value={author.Id} />
            <button type="submit" class="cursor-pointer">
              <IconContainer icon="mdi:close" width="24" />
            </button>
          </form>
        </div>
      {/each}
    {:else}
      <p class="p-2">{m.project_side_authors_empty()}</p>
    {/if}
  </div>
  <div class="bg-neutral p-2">
    <form action="?/addAuthor" method="post" use:enhance>
      <div class="flex place-content-between space-x-2">
        <select class="grow select select-bordered" name="author" bind:value={$form.author}>
          {#if availableAuthors.length}
            {#each availableAuthors.sort((a, b) => byName(a, b, getLocale())) as author}
              <option value={author.Id}>
                {author.Name}
              </option>
            {/each}
          {:else}
            <option disabled selected value="">
              {m.project_side_authors_emptyGroup()}
            </option>
          {/if}
        </select>
        <button type="submit" class="btn btn-primary">
          {m.project_side_authors_form_submit()}
        </button>
      </div>
    </form>
  </div>
</div>
