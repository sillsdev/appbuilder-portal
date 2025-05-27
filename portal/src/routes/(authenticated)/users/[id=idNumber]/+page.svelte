<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

{#snippet pfp(size: number, className?: string)}
  <img
    class="{className}"
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
      </div>
      {#if data.user}
        <p>{data.user.Email}</p>
        <p>{data.user.Phone ?? m.profile_noPhone()}</p>
        <p>{data.user.Timezone ?? m.profile_noTimezone()}</p>
      {/if}
    </div>
  </div>
</div>
