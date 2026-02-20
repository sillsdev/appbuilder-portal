<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { instructions } from './instructions';
  import { invalidate } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import SortTable from '$lib/components/SortTable.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import ReleaseInfo from '$lib/products/components/ReleaseInfo.svelte';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import { userTasksSSE } from '$lib/stores';
  import { bytesToHumanSize, toast } from '$lib/utils';
  import { byName, byNumber, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, submit } = superForm(data.taskForm, {
    onChange: ({ paths }) => {
      if (
        paths.includes('flowAction') &&
        !($form.flowAction === data.actions[0] && checksRemaining)
      ) {
        submit();
      }
    },
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    },
    onUpdate: ({ form, result }) => {
      if (form.valid && result.type === 'success') {
        const actionData = result.data;
        waiting = !!actionData.hasTarget;
        toast('success', m.tasks_submitted({ action: form.data.flowAction }));
        if (!actionData.hasTransitions) {
          history.back();
        }
      }
    }
  });
  let urlCopied = $state(false);
  let waiting = $state(false);

  $effect(() => {
    if ($userTasksSSE?.length) {
      const productTasks = $userTasksSSE.filter((t) => t.ProductId === page.params.product_id);
      const fallback = new Date().valueOf();
      const oldTask = productTasks.find(
        (t) => (t.DateUpdated?.valueOf() ?? fallback) <= data.loadTime
      );
      const waitRead = untrack(() => waiting);
      // waiting and task updated
      if (waitRead && productTasks.length && !oldTask) {
        invalidate('task:id:load');
        waiting = false;
      }
      // not waiting but task updated/deleted (by some other user)
      else if (!(waitRead || oldTask)) {
        if (productTasks.length) {
          invalidate('task:id:load');
        } else {
          history.back();
        }
        toast('warning', m.tasks_reloaded());
      }
    }
  });

  let instructionContainer: HTMLDivElement | undefined = $state(undefined);

  let triggerRecheck = $state(false);
  const checksRemaining = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data.instructions;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    triggerRecheck; // depend on external variable to recheck the checkboxes
    return Array.from(
      (instructionContainer?.querySelectorAll(
        'input[type="checkbox"]:required'
      ) as NodeListOf<HTMLInputElement>) ?? []
    ).some((e) => !e.checked);
  });

  const options = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    data.instructions;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    triggerRecheck; // depend on external variable to recheck the checkboxes
    return Array.from(
      (instructionContainer?.querySelectorAll(
        'input[type="checkbox"]:optional, input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>) ?? []
    )
      .filter((e) => e.checked && e.value)
      .flatMap((e) => [e.value, e.name])
      .filter(Boolean);
  });
</script>

<div class="p-5">
  <div class="flex flex-row gap-x-3 flex-wrap">
    <div class="breadcrumbs">
      <ul>
        <li><a class="link" href={localizeHref('/tasks')}>{m.sidebar_myTasks({ count: 0 })}</a></li>
        <li>
          <a class="link" href={localizeHref(`/projects/${data.projectId}`)}>
            {data.fields.projectName}
          </a>
        </li>
        <li>{data.productDescription}</li>
      </ul>
    </div>
  </div>
  {#if !waiting}
    <form method="POST" use:enhance>
      {#if data.actions?.length}
        <div class="flex flex-row gap-x-3 py-4">
          {#each data.actions as action, i}
            {@const disabled = i === 0 && checksRemaining}
            <BlockIfJobsUnavailable class="btn btn-primary">
              {#snippet altContent()}
                {action}
              {/snippet}
              <label class="btn btn-primary" class:btn-disabled={disabled}>
                {action}<!-- ISSUE: #1104 i18n (after MVP) -->
                <input
                  {disabled}
                  type="radio"
                  name="flowAction"
                  bind:group={$form.flowAction}
                  class="hidden"
                  value={action}
                />
              </label>
            </BlockIfJobsUnavailable>
          {/each}
        </div>
      {/if}
      <LabeledFormInput key="transitions_comment">
        <textarea class="textarea h-24 w-full" name="comment" bind:value={$form.comment}></textarea>
      </LabeledFormInput>
      <input type="hidden" name="state" value={$form.state} />
      {#each options as opt}
        <input type="hidden" name="options" value={opt} />
      {/each}
    </form>
  {/if}
  <hr class="border-t-4 my-2" />
  <h2>
    {waiting ? 'Waiting' : data.taskTitle}
  </h2>
  {#if !waiting}
    {#if data.previousTask?.Comment}
      <LabeledFormInput
        key="tasks_previousComment"
        params={{ activityName: data.previousTask.InitialState ?? '' }}
      >
        <TaskComment comment={data.previousTask.Comment} />
      </LabeledFormInput>
    {/if}
    <LabeledFormInput key="project_name">
      <input type="text" class="input w-full" readonly value={data.fields.projectName} />
    </LabeledFormInput>
    <LabeledFormInput key="common_description">
      <textarea class="textarea w-full" readonly value={data.fields.projectDescription}></textarea>
    </LabeledFormInput>
    <div id="fields" class="flex flex-col w-full md:flex-row md:flex-wrap">
      {#if data.fields.ownerName}
        <LabeledFormInput
          key="projectTable_owner"
          class="md:w-1/2"
          input={{
            readonly: true,
            icon: Icons.User
          }}
          value={data.fields.ownerName}
          validate={false}
        />{/if}{#if data.fields.ownerEmail}
        <LabeledFormInput
          key="profile_email"
          class="md:w-1/2"
          input={{
            readonly: true,
            icon: Icons.Email
          }}
          value={data.fields.ownerEmail}
          validate={false}
        />
      {/if}
      {#if data.fields.storeDescription}
        <LabeledFormInput
          key="stores_name"
          class="md:w-1/2"
          input={{
            readonly: true,
            icon: Icons.Store
          }}
          value={data.fields.storeDescription}
          validate={false}
        />
      {/if}
      {#if data.fields.listingLanguageCode}
        <LabeledFormInput
          key="tasks_storeLanguage"
          class="md:w-1/2"
          input={{
            readonly: true,
            icon: Icons.GooglePlay
          }}
          value={data.fields.listingLanguageCode}
          validate={false}
        />
      {/if}
      {#if data.fields.projectURL}
        <LabeledFormInput key="tasks_appProjectURL" class="md:w-1/2">
          <span class="input w-full flex flex-row gap-2 items-center">
            <IconContainer icon={Icons.URL} width={20} />
            <input type="text" class="grow" readonly value={data.fields.projectURL} />
            <button
              class="cursor-copy"
              onclick={() => {
                if (data.fields.projectURL) {
                  navigator.clipboard.writeText(data.fields.projectURL);
                  urlCopied = true;
                  setTimeout(() => {
                    urlCopied = false;
                  }, 5000);
                }
              }}
            >
              {#if urlCopied}
                <IconContainer icon={Icons.Checkmark} width={24} class="text-success" />
              {:else}
                <IconContainer icon={Icons.Copy} width={24} />
              {/if}
            </button>
          </span>
        </LabeledFormInput>
      {/if}
      {#if data.fields.displayProductDescription}
        <LabeledFormInput key="tasks_product" class="md:w-1/2">
          <input type="text" class="input w-full" readonly value={data.productDescription} />
        </LabeledFormInput>
      {/if}
      {#if data.fields.appType}
        <LabeledFormInput key="project_appType" class="md:w-1/2">
          <input type="text" class="input w-full" readonly value={data.fields.appType} />
        </LabeledFormInput>
      {/if}
      {#if data.fields.projectLanguageCode}
        <LabeledFormInput key="project_languageCode" class="md:w-1/2">
          <div class="input w-full">
            <IconContainer icon={Icons.Language} width={20} />
            <input type="text" readonly value={data.fields.projectLanguageCode} />
          </div>
        </LabeledFormInput>
      {/if}
    </div>
  {/if}
  {#if data.instructions}
    <!-- svelte:component is dynamic now. Since this won't change, using @const. 
     The below was generated by the migration script -->
    {@const SvelteComponent = instructions[waiting ? 'waiting' : data.instructions]}
    <div
      class="py-2"
      id="instructions"
      bind:this={instructionContainer}
      onchange={() => (triggerRecheck = !triggerRecheck)}
    >
      <SvelteComponent />
    </div>
  {/if}
  {#if data.release}
    <h3>{m.publications_results()}</h3>
    {#if data.releaseErrors && data.releaseErrors.length}
      <div id="error-box" class="text-error">
        {#each data.releaseErrors as message}
          <div>
            {message.replace(
              /* eslint-disable-next-line no-control-regex */
              /\x1b\[[^m]*m/gi,
              ''
            )}
          </div>
        {/each}
      </div>
    {/if}
    <ReleaseInfo release={data.release} class={{ default: 'border', header: 'bg-neutral' }} />
  {/if}
  {#if data?.files?.length && !waiting}
    {@const locale = getLocale()}
    <h3>{m.products_files_title()}</h3>
    <div class="w-full overflow-x-auto">
      <SortTable
        class="max-h-none w-full sm:hidden"
        data={data.files}
        columns={[
          {
            id: 'artifactType',
            header: m.common_type(),
            compare: (a, b) => byString(a.ArtifactType, b.ArtifactType, locale)
          },
          {
            id: 'fileSize',
            header: m.products_size(),
            compare: (a, b) => byNumber(a.FileSize, b.FileSize)
          }
        ]}
      >
        {#snippet row(file)}
          <tr
            class="cursor-pointer hover:bg-neutral"
            onclick={() => {
              if (file.Url) {
                window.open(file.Url, '_blank')?.focus();
              }
            }}
          >
            <td class="border">
              {file.ArtifactType}
            </td>
            <td class="border">
              {bytesToHumanSize(file.FileSize)}
            </td>
          </tr>
          <tr class="cursor-pointer hover:bg-neutral">
            <td class="border wrap-break-word" colspan="2">
              {#if file.Url}
                <a class="link" href={file.Url} target="_blank">{file.Url}</a>
              {:else}
                -
              {/if}
            </td>
          </tr>
        {/snippet}
      </SortTable>
      <SortTable
        class="max-h-none hidden sm:block"
        data={data.files}
        columns={[
          {
            id: 'artifactType',
            header: m.common_type(),
            compare: (a, b) => byString(a.ArtifactType, b.ArtifactType, locale)
          },
          {
            id: 'fileSize',
            header: m.products_size(),
            compare: (a, b) => byNumber(a.FileSize, b.FileSize)
          },
          {
            id: 'url',
            header: m.tasks_downloadURL(),
            class: 'w-1/2'
          }
        ]}
      >
        {#snippet row(file)}
          <tr
            class="cursor-pointer hover:bg-neutral"
            onclick={() => {
              if (file.Url) {
                window.open(file.Url, '_blank')?.focus();
              }
            }}
          >
            <td class="border">
              {file.ArtifactType}
            </td>
            <td class="border">
              {bytesToHumanSize(file.FileSize)}
            </td>
            <td class="border wrap-break-word">
              {#if file.Url}
                <a
                  class="link"
                  href={file.Url}
                  target="_blank"
                  onclick={(e) => e.stopPropagation()}
                >
                  {file.Url}
                </a>
              {:else}
                -
              {/if}
            </td>
          </tr>
        {/snippet}
      </SortTable>
    </div>
  {/if}
  {#if data?.reviewers?.length && !waiting}
    {@const locale = getLocale()}
    <h3>{m.reviewers_title()}</h3>
    <div class="w-full overflow-x-auto">
      <SortTable
        class="max-h-none"
        data={data.reviewers}
        columns={[
          {
            id: 'name',
            header: m.common_name(),
            compare: (a, b) => byName(a, b, locale)
          },
          {
            id: 'email',
            header: m.profile_email(),
            compare: (a, b) => byString(a.Email, b.Email, locale)
          }
        ]}
      >
        {#snippet row(reviewer)}
          <tr class="cursor-pointer hover:bg-neutral">
            <td class="border">
              {reviewer.Name}
            </td>
            <td class="border">
              {reviewer.Email}
            </td>
          </tr>
        {/snippet}
      </SortTable>
    </div>
  {/if}
</div>

<style>
  #error-box {
    border: calc(2 * var(--border)) inset var(--color-base-content);
    margin-bottom: calc(2 * var(--spacing));
    padding: calc(2 * var(--spacing));
  }
  #error-box {
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklch, var(--color-base-content) 50%, #0000);
      background-color: color-mix(in oklch, var(--color-base-300) 15%, #0000);
    }
  }
  h2,
  h3 {
    padding-left: 0px;
  }

  /*this VVV technique allows css rules to break svelte scoping downwards*/
  #instructions :global(ul) {
    padding-left: calc(var(--spacing) * 10);
    list-style-type: disc;
  }
  #instructions :global(ol) {
    padding-left: calc(var(--spacing) * 10);
    list-style-type: decimal;
  }
  #instructions :global(h3) {
    color: var(--color-accent);
  }
  #instructions :global(:where(h3, h4)) {
    padding-left: 0px;
  }
  #instructions :global(a) {
    cursor: pointer;
    text-decoration-line: underline;
  }

  #fields :global(label):nth-child(odd) {
    padding-right: calc(var(--spacing) * 1);
  }
  #fields :global(label):nth-child(even) {
    padding-left: calc(var(--spacing) * 1);
  }
  #fields :global(label):nth-child(odd):last-child {
    padding-right: 0px;
    width: 100%;
  }
</style>
