<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
  import type { AuthorSchema } from './valibot';
  import { enhance as svk_enhance } from '$app/forms';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    group: Prisma.GroupsGetPayload<{ select: { Name: true } }>;
    projectAuthors: Prisma.AuthorsGetPayload<{
      select: {
        Id: true;
        Users: {
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

  const { enhance } = superForm(formData, {
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    },
    onUpdated: () => {
      selectedAuthor = null;
    }
  });

  let selectOpen = $state(false);
  let selectedAuthor: (typeof availableAuthors)[number] | null = $state(null);
</script>

<div class="card card-bordered border-slate-400 rounded-md max-w-full">
  <div class="bg-neutral">
    <h2>{m.authors_title()}</h2>
  </div>
  <div class="p-2">
    {#if projectAuthors.length}
      {@const locale = getLocale()}
      {#each projectAuthors.toSorted((a, b) => byName(a.Users, b.Users, locale)) as author}
        <div class="flex flex-row w-full place-content-between p-2">
          <span>{author.Users.Name}</span>
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
                <input type="hidden" name="id" value={author.Id} />
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
        <div class="flex space-x-2">
          <div class="grow">
            <input type="hidden" name="author" value={selectedAuthor?.Id} />
            <Dropdown
              dropdownClasses="dropdown-start w-full"
              labelClasses="select select-bordered flex-nowrap grow w-full pl-1 {availableAuthors.length
                ? ''
                : 'btn-disabled'}"
              contentClasses="menu"
              bind:open={selectOpen}
            >
              {#snippet label()}
                <span class="px-1 w-full text-left">
                  {#if availableAuthors.length}
                    {selectedAuthor?.Name ?? ' '}
                  {:else}
                    {m.authors_emptyGroup()}
                  {/if}
                </span>
              {/snippet}
              {#snippet content()}
                <ul class="menu menu-compact overflow-hidden rounded-md">
                  {#if availableAuthors.length}
                    {#each availableAuthors.toSorted((a, b) => byName(a, b, getLocale())) as author}
                      <li class="w-full rounded-none">
                        <button
                          type="button"
                          class="text-nowrap"
                          class:font-bold={author.Id === selectedAuthor?.Id}
                          onclick={() => {
                            selectedAuthor = author;
                          }}
                        >
                          {author.Name}
                        </button>
                      </li>
                    {/each}
                  {:else}
                    <li class="w-full rounded-none">
                      {m.authors_emptyGroup()}
                    </li>
                  {/if}
                </ul>
              {/snippet}
            </Dropdown>
          </div>
          <BlockIfJobsUnavailable className="btn btn-primary">
            {#snippet altContent()}
              {m.authors_submit()}
            {/snippet}
            <button type="submit" class="btn btn-primary">
              {m.authors_submit()}
            </button>
          </BlockIfJobsUnavailable>
        </div>
      </form>
    {/if}
  </div>
</div>
