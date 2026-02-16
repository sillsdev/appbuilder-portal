<script
  lang="ts"
  generics="AppType extends { Id: number; Name: string; Description?: string | null }"
>
  import type { Snippet } from 'svelte';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    applicationTypes: AppType[];
    selector?: Snippet<[AppType]>;
  }

  let { applicationTypes, selector }: Props = $props();
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    {#each applicationTypes.toSorted((a, b) => byString(a.Description, b.Description, getLocale())) as appType}
      <div class="flex space-x-2">
        {@render selector?.(appType)}
        <div>
          <div class="font-medium">{appType.Description ?? ''}</div>
        </div>
      </div>
    {/each}
  </div>
  <div class="grow"></div>
</div>
