<script lang="ts">
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import Pagination from '$lib/components/Pagination.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { RoleId } from '$lib/prisma';
  import { orgActive } from '$lib/stores';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { hasRoleForOrg, isAdminForOrg } from '$lib/utils/roles';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let items = $state(data.items);
  let count = $state(data.count);

  afterNavigate(() => {
    items = data.items;
    count = data.count;
  });

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    multipleSubmits: 'abort',
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

  $effect(() => {
    const roles = data.session.user.roles;
    const hasAccess =
      !!$orgActive &&
      (isAdminForOrg($orgActive, roles) || hasRoleForOrg($orgActive, RoleId.SupportAgent, roles));
    if (!selectGotoFromOrg(hasAccess, `/support-data/${$orgActive}`, `/support-data`)) {
      setOrgFromParams($orgActive, page.params.orgId);
    }
  });
</script>

<div class="mx-auto w-full max-w-6xl p-4">
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <h1 class="p-0">{m.sidebar_supportData()}</h1>
    <a
      class="btn btn-primary"
      href={localizeHref(data.orgId ? `/support-data/new/${data.orgId}` : '/support-data/new')}
    >
      {m.supportData_newRequest()}
    </a>
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
                title={m.supportData_editRequest()}
              >
                <IconContainer icon={Icons.Edit} width={20} />
                {m.supportData_edit()}
              </a>
            </div>
            <div class="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1">
              <span class="flex items-center">
                <IconContainer icon={Icons.User} width={20} class="mr-1 shrink-0" />
                {item.Agent?.Name ??
                  item.Agent?.Email ??
                  m.supportData_userFallback({ id: item.AgentId })}
              </span>
              <span class="flex items-center">
                <IconContainer icon={Icons.Organization} width={20} class="mr-1 shrink-0" />
                {item.Organization.Name}
              </span>
              <span class="flex items-center" title={m.supportData_dateUploaded()}>
                <IconContainer icon={Icons.DateRange} width={20} class="mr-1 shrink-0" />
                {getTimeDateString(item.DateUploaded)}
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
                {m.supportData_openTicket()}
              </a>
            {:else}
              <span class="mt-2 inline-flex items-center opacity-70">
                <IconContainer icon={Icons.URL} width={20} class="mr-1" />
                {m.supportData_noTicketUrl()}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.supportData_noRequests()}</p>
  {/if}

  <form method="POST" action="?/page" use:enhance>
    <div class="mt-4">
      <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
    </div>
  </form>
</div>
