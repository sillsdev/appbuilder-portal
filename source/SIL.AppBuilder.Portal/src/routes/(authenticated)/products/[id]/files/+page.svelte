<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import BuildArtifacts from './components/BuildArtifacts.svelte';

  export let data: PageData;
</script>

<div class="w-full h-full max-w-6xl mx-auto p-4">
  <div id="header">
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
  <div id="files">
    {#each data.builds as build}
      <BuildArtifacts
        {build}
        latestBuildId={data.product?.WorkflowBuildId}
        hidden={build.BuildId !== data.product?.WorkflowBuildId}
      />
    {/each}
  </div>
</div>

<style lang="postcss">
  #header {
    height: 15%;
  }
  #files {
    height: 85%;
    @apply overflow-y-auto;
    scrollbar-gutter: stable both-edges;
  }
</style>
