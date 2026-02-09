<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
  import type { AuthorSchema } from './valibot';
  import { enhance as svk_enhance } from '$app/forms';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    group: Prisma.GroupsGetPayload<{ select: { Name: true } }>;
    projectAuthors: Prisma.AuthorsGetPayload<{
      select: {
        User: {
          select: {
            Id: true;
            Name: true;
          };
        };
      };
    }>[];
    availableAuthors: Prisma.UsersGetPayload<{
      select: {
        Id: true;
        Name: true;
      };
    }>[];
    formData: SuperValidated<Infer<AuthorSchema>>;
    createEndpoint: string;
    deleteEndpoint: string;
    canEdit: boolean;
  }

  let {
    projectAuthors,
    availableAuthors,
    formData,
    createEndpoint,
    deleteEndpoint,
    canEdit
  }: Props = $props();

  const { form, enhance } = superForm(formData, {
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });
</script>

<div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
  <div class="bg-neutral">
    <h2>{m.authors_title()}</h2>
  </div>
  <div class="p-2">
    {#if projectAuthors.length}
      {@const locale = getLocale()}
      {#each projectAuthors.toSorted((a, b) => byName(a.User, b.User, locale)) as author}
        <div class="flex flex-row w-full place-content-between p-2">
          <span>{author.User.Name}</span>
          {#if canEdit}
            <BlockIfJobsUnavailable>
              {#snippet altContent()}
                <IconContainer icon="mdi:close" width="24" />
              {/snippet}
              <form
                action="?/{deleteEndpoint}"
                method="post"
                use:svk_enhance={() =>
                  ({ update, result }) => {
                    if (result.type === 'error') {
                      if (result.status === 503) {
                        toast('error', m.system_unavailable());
                      }
                    }
                    update({ reset: false });
                  }}
              >
                <input type="hidden" name="id" value={author.User.Id} />
                <button type="submit" class="cursor-pointer">
                  <IconContainer icon="mdi:close" width="24" />
                </button>
              </form>
            </BlockIfJobsUnavailable>
          {/if}
        </div>
      {/each}
    {:else}
      <p class="p-2">{m.authors_empty()}</p>
    {/if}
  </div>

  <div class="bg-neutral p-2">
    {#if canEdit}
      <form action="?/{createEndpoint}" method="post" use:enhance>
        <div class="flex place-content-between space-x-2">
          <select class="grow select" name="author" bind:value={$form.author} required>
            {#if availableAuthors.length}
              {#each availableAuthors.sort((a, b) => byName(a, b, getLocale())) as author}
                <option value={author.Id}>
                  {author.Name}
                </option>
              {/each}
            {:else}
              <option disabled selected value="">
                {m.authors_emptyGroup()}
              </option>
            {/if}
          </select>
          <BlockIfJobsUnavailable class="btn btn-primary">
            {#snippet altContent()}
              <IconContainer icon="mdi:user-add" width={20} />
              {m.authors_submit()}
            {/snippet}
            <button type="submit" class="btn btn-primary">
              {@render altContent()}
            </button>
          </BlockIfJobsUnavailable>
        </div>
      </form>
    {/if}
  </div>
</div>
