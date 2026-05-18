<script lang="ts">
  import type { PageData } from './$types';
  import CopyField from '$lib/components/settings/CopyField.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { Icons, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="p-5">
  <div class="flex flex-row gap-x-3 flex-wrap">
    <div class="breadcrumbs">
      <ul>
        <li><a class="link" href={localizeHref('/tasks')}>{m.sidebar_myTasks({ count: 0 })}</a></li>
        <li>
          <a class="link" href={localizeHref(`/projects/${data.projectId}#${data.productId}`)}>
            {data.projectName}
          </a>
        </li>
        <li>
          <IconContainer
            icon={getProductIcon(data.productType)}
            width={24}
          />{data.productDescription}
        </li>
      </ul>
    </div>
  </div>

  <hr class="border-t-4 my-2" />
  <h2>{data.taskTitle}</h2>

  <div class="flex flex-col w-full md:flex-row md:flex-wrap md:gap-x-2">
    <LabeledFormInput
      key="profile_email"
      class="md:w-1/2"
      input={{
        readonly: true,
        icon: Icons.Email
      }}
      value={data.deletionRequest.email}
      validate={false}
    />
    <LabeledFormInput key="common_change" class="md:w-1/2">
      <input class="input w-full" type="text" readonly value={data.deletionRequest.change} />
    </LabeledFormInput>
    {#if data.deletionRequest.dateConfirmed}
      <LabeledFormInput key="common_updated" class="md:w-1/2">
        <input
          class="input w-full"
          type="text"
          readonly
          value={getTimeDateString(data.deletionRequest.dateConfirmed)}
        />
      </LabeledFormInput>
    {/if}
    {#if data.packageName}
      <LabeledFormInput key="tasks_packageName" class="md:w-1/2">
        <span class="input w-full flex flex-row gap-2 items-center">
          <input type="text" class="grow" readonly value={data.packageName} />
          <CopyField value={data.packageName} />
        </span>
      </LabeledFormInput>
    {/if}
    <LabeledFormInput key="project_name" class="w-full">
      <span class="input w-full flex flex-row gap-2 items-center">
        <input type="text" class="grow" readonly value={data.projectName} />
        <CopyField value={data.projectName} />
      </span>
    </LabeledFormInput>
    <LabeledFormInput key="common_description" class="w-full">
      <textarea class="textarea w-full" readonly value={data.projectDescription}></textarea>
    </LabeledFormInput>
  </div>

  <form method="POST" class="py-4">
    <button type="submit" class="btn btn-primary">Mark complete</button>
  </form>
</div>
