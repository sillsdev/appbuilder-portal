<script lang="ts">
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import Pagination from '$lib/components/Pagination.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let items = $state(data.items);
  let count = $state(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange() {
      submit();
    },
    onUpdate(event) {
      const result = event.result.data as FormResult<{
        query: { data: PageData['items']; count: number };
      }>;
      if (event.form.valid && result.query) {
        items = result.query.data;
        count = result.query.count;
      }
    }
  });

  function formatDate(value?: Date | string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
</script>

<div class="mx-auto w-full max-w-6xl p-4">
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="p-0">Support Data</h1>
    <a class="btn btn-primary" href={localizeHref('/support-data/new')}>New request</a>
  </div>

  {#if items.length > 0}
    <div class="w-full relative p-4">
      {#each items as item}
        <div class="rounded-md bg-neutral border border-slate-400 my-4 overflow-hidden w-full">
          <div class="p-4 pb-2 w-full">
            <div class="flex flex-row flex-wrap items-start gap-2">
              <a
                href={localizeHref(`/support-data/${item.Id}`)}
                class="flex flex-row grow items-start"
              >
                <b class="[color:var(--color-link)]">{item.Name}</b>
              </a>
              <a
                class="btn btn-ghost btn-sm"
                href={localizeHref(`/support-data/${item.Id}/edit`)}
                title="Edit request"
              >
                <IconContainer icon={Icons.Edit} width={20} />
                Edit
              </a>
            </div>
            <div class="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1">
              <span class="flex items-center">
                <IconContainer icon={Icons.User} width={20} class="mr-1 shrink-0" />
                {item.Agent?.Name ?? item.Agent?.Email ?? `User ${item.AgentId}`}
              </span>
              <span class="flex items-center" title="Date uploaded">
                <IconContainer icon={Icons.DateRange} width={20} class="mr-1 shrink-0" />
                {formatDate(item.DateUploaded)}
              </span>
              <span class="font-mono text-xs opacity-60">{item.Id}</span>
            </div>
          </div>
          <div class="w-full bg-base-100 p-4 pt-2">
            {#if item.Description}
              <p class="whitespace-pre-wrap">{item.Description}</p>
            {/if}
            {#if item.TicketUrl}
              <a
                class="link mt-2 inline-block break-all"
                href={item.TicketUrl}
                target="_blank"
                rel="noreferrer"
                title={item.TicketUrl}
              >
                <IconContainer icon={Icons.URL} width={20} class="mr-1 inline-block" />
                Open ticket
              </a>
            {:else}
              <span class="mt-2 inline-flex items-center opacity-70">
                <IconContainer icon={Icons.URL} width={20} class="mr-1" />
                No ticket URL
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="m-8">No support data requests yet.</p>
  {/if}

  <form method="POST" action="?/page" use:enhance>
    <div class="mt-4">
      <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
    </div>
  </form>
</div>
