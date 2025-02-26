<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import BuildArtifacts from '$lib/products/components/BuildArtifacts.svelte';
  import { canModifyProject } from '$lib/projects/common';
  import { getRelativeTime } from '$lib/timeUtils';
  import { byName } from '$lib/utils';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <div class="flex flex-col p-6">
    <div>
      {#if canModifyProject(data.session, data.project.Owner.Id, data.project.Organization.Id)}
        <a class="link" href="/projects/{data.project.Id}">
          <h1 class="p-0">
            {data.project?.Name} ({data.project.Language ?? ''})
          </h1>
        </a>
      {:else}
        <h1 class="p-0">
          {data.project?.Name} ({data.project.Language ?? ''})
        </h1>
      {/if}
      <span>
        {m.project_createdOn()}
        <Tooltip tip={data.project?.DateCreated?.toLocaleString(languageTag())}>
          {data.project?.DateCreated ? getRelativeTime(data.project?.DateCreated) : 'null'}
        </Tooltip>
      </span>
    </div>
    {#if /*This should always be true. This is only so @const can be used.*/ data.project.Organization}
      {@const org = data.project.Organization}
      <div class="flex flex-row">
        <div>
          {#if org.LogoUrl}
            <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
          {:else}
            <div class="inline-block p-2 h-16 w-16 align-middle">
              <div class="bg-white w-full h-full"></div>
            </div>
          {/if}
        </div>
        <div class="pl-4">
          <h2 class="pl-0">{org.Name}</h2>
          <i class="block">
            {m.project_organizationContact()}
            <strong>{org.Owner.Name}</strong>
          </i>
          <i class="block">
            {m.project_projectOwner()}
            <strong>{data.project.Owner.Name}</strong>
          </i>
        </div>
      </div>
    {/if}
  </div>
  <div class="divider"></div>
  <div class="w-full px-4">
    <p>{data.project.Description ?? ''}</p>
    <div class="pt-2">
      {#if !data.project?.Products.length}
        {m.projectTable_noProducts()}
      {:else}
        {@const langTag = languageTag()}
        {#each data.project.Products.sort( (a, b) => byName(a.ProductDefinition, b.ProductDefinition, langTag) ) as product}
          {@const release = product.ProductPublications.at(0)}
          {@const build = release?.ProductBuild}
          <div>
            <IconContainer icon={getIcon(product.ProductDefinition.Name ?? '')} width="32" />
            {product.ProductDefinition.Name}
          </div>
          {#if build}
            <BuildArtifacts
              build={{ ...build, ProductPublications: [release] }}
              latestBuildId={build.BuildId}
            />
          {:else}
            <div class="p-4">
              <!-- Is this the correct i18n key? -->
              {m.project_products_unpublished()}
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
