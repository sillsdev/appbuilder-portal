<script lang="ts">
  import type { PageData } from './$types';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { RoleId } from '$lib/prisma';
  import BuildArtifacts from '$lib/products/components/BuildArtifacts.svelte';
  import { byName } from '$lib/utils/sorting';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const time = $derived(getRelativeTime(data.project.DateCreated));

  function canViewProject(project: typeof data.project) {
    return (
      data.session.user.roles.some(
        ([org, role]) =>
          (org === project.Organization.Id && role === RoleId.OrgAdmin) ||
          role === RoleId.SuperAdmin
      ) || data.sessionGroups.includes(project.GroupId)
    );
  }
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <div class="flex flex-col p-6">
    <div>
      {#if canViewProject(data.project)}
        <a class="link" href={localizeHref(`/projects/${data.project.Id}`)}>
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
        <Tooltip tip={getTimeDateString(data.project?.DateCreated)}>
          {data.project?.DateCreated ? $time : 'null'}
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
            {m.project_orgContact()}:
            <strong>
              {#if org.ContactEmail}
                <a class="link" href="mailto:{org.ContactEmail}">{org.ContactEmail}</a>
              {:else}
                {m.common_notAvailable()}
              {/if}
            </strong>
          </i>
          <i class="block">
            {m.project_owner()}:
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
        {@const locale = getLocale()}
        {#each data.project.Products.toSorted( (a, b) => byName(a.ProductDefinition, b.ProductDefinition, locale) ) as product}
          {@const build = product.ProductPublications.at(0)?.ProductBuild}
          <div>
            <IconContainer icon={getIcon(product.ProductDefinition.Name ?? '')} width="32" />
            {product.ProductDefinition.Name}
          </div>
          {#if build}
            <BuildArtifacts
              {build}
              artifacts={build.ProductArtifacts}
              latestBuildId={build.BuildEngineBuildId}
              allowDownloads={data.allowDownloads}
              buildEngineUrl={data.buildEngineUrl}
            />
          {:else}
            <div class="p-4">
              {m.projects_noBuilds()}
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
