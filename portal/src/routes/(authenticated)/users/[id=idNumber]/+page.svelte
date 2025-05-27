<script lang="ts">
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

{#snippet pfp(size: number, className?: string)}
  <img
    class={className}
    src={`https://www.gravatar.com/avatar/${data.gravatarHash ?? ''}?s=${size}&d=identicon`}
    alt={m.profile_pictureTitle()}
  />
{/snippet}

<div class="mx-auto px-4 w-full md:max-w-3/4">
  <h2 class="pl-0">{m.profile_generalInformation()}</h2>
  <div class="flex flex-row">
    <div class="hidden sm:block">
      {@render pfp(130, 'pr-8')}
    </div>
    <div>
      <div class="flex flex-row">
        <div class="block sm:hidden">
          {@render pfp(50, 'pr-1')}
        </div>
        <h3 class="pl-0">{data.DisplayName}</h3>
        {#if data.canEdit}
          <Tooltip className="tooltip-bottom" tip={m.common_clickToEdit()}>
            <a href={localizeHref(`/users/${page.params.id}/settings/profile`)}>
              <IconContainer width="24" icon="mdi:pencil" />
            </a>
          </Tooltip>
        {/if}
      </div>
      {#if data.user}
        <p>{data.user.Email}</p>
        <p>{data.user.Phone ?? m.profile_noPhone()}</p>
        <p>{data.user.Timezone ?? m.profile_noTimezone()}</p>
      {/if}
    </div>
  </div>
</div>
