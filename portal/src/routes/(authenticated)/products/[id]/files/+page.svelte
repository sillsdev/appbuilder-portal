<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import BuildArtifacts from '$lib/products/components/BuildArtifacts.svelte';
  import { superForm, type FormResult } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let builds = $state(data.builds);
  let count = $state(data.count)

  const { form, enhance, submit } = superForm(data.form, {
    resetForm: false,
    onChange(event) {
      submit();
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{
        query: { data: any[], count: number };
      }>;
      if (event.form.valid && data.query) {
        builds = data.query.data;
        count = data.query.count;
      }
    }
  });
</script>

<div class="w-full h-full max-w-6xl mx-auto p-4 flex flex-col">
  <div>
    <div class="breadcrumbs text-sm pl-4">
      <ul>
        <li>
          <a class="link" href="/projects/{data.product?.Project.Id}">
            {data.product?.Project.Name}
          </a>
        </li>
        <li>
          <IconContainer
            icon={getIcon(data.product?.ProductDefinition.Name ?? '')}
            width="24"
          />{data.product?.ProductDefinition.Name}
        </li>
      </ul>
    </div>
    <h1 class="pl-4">{m.products_files_title()}</h1>
  </div>
  <div id="files" class="overflow-y-auto grow">
    {#each builds as build}
      <BuildArtifacts
        {build}
        latestBuildId={data.product?.WorkflowBuildId}
      />
    {/each}
  </div>
  <form method="POST" action="?/page" use:enhance>
    <Pagination
      bind:page={$form.page}
      bind:size={$form.size}
      total={count}
      extraSizeOptions={[3]}
    />
  </form>
</div>
