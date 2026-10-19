<script lang="ts">
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import Pagination from '$lib/components/Pagination.svelte';
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

  <form method="POST" action="?/page" use:enhance class="mt-4">
    {#if items.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Request</th>
              <th>Ticket</th>
              <th>Agent</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item}
              <tr>
                <td>
                  <a class="link font-semibold" href={localizeHref(`/support-data/${item.Id}`)}>
                    {item.Name}
                  </a>
                  {#if item.Description}
                    <p class="mt-1 max-w-xl truncate text-sm opacity-70" title={item.Description}>
                      {item.Description}
                    </p>
                  {/if}
                  <p class="mt-1 font-mono text-xs opacity-60">{item.Id}</p>
                </td>
                <td>
                  {#if item.TicketUrl}
                    <a
                      class="link"
                      href={item.TicketUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={item.TicketUrl}
                    >
                      Open ticket
                    </a>
                  {:else}
                    <span>—</span>
                  {/if}
                </td>
                <td>
                  {item.Agent?.Name ?? item.Agent?.Email ?? `User ${item.AgentId}`}
                </td>
                <td>{formatDate(item.DateUploaded)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="mt-6 alert">
        <span>No support data requests yet.</span>
      </div>
    {/if}

    <div class="mt-4">
      <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
    </div>
  </form>
</div>
