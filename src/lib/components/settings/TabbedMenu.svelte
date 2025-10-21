<script lang="ts" generics="Route extends RouteId">
  import type { Snippet } from 'svelte';
  import IconContainer from '../IconContainer.svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { RouteId, RouteParams } from '$app/types';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    menuItems: {
      route: string;
      text: string;
    }[];
    baseRouteId: Route;
    routeParams?: RouteParams<Route>;
    titleString?: string;
    allowTitleWrap?: boolean;
    children?: Snippet;
    title?: Snippet;
  }

  let {
    menuItems = [],
    baseRouteId,
    routeParams,
    titleString,
    allowTitleWrap = false,
    children,
    title
  }: Props = $props();

  const base = $derived.by(() =>
    resolve(
      //@ts-expect-error this is the best I can do with the types I have been granted access to
      baseRouteId,
      routeParams
    )
  );

  function isActive(menuRoute: string) {
    return page.route.id?.replace(baseRouteId, '').startsWith('/' + menuRoute);
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="flex flex-col">
    <div class="p-4 sm:pr-0 sm:sticky top-0 sm:self-start z-10 bg-base-100">
      {#if title}
        {@render title()}
      {:else}
        <h1 class="p-4" class:text-nowrap={!allowTitleWrap}>{titleString}</h1>
      {/if}
      <div class="rounded-sm border-slate-600 bg-base-200 mx-auto sm:hidden">
        <!-- Mobile dropdown menu -->
        <div class="slidedown p-3" role="button" tabindex="0">
          <div class="flex place-content-between">
            <span>
              {menuItems.find((item) =>
                page.route.id?.split(baseRouteId + '/')[1]?.startsWith(item.route)
              )?.text}
            </span>
            <IconContainer icon="gridicons:dropdown" width="24" />
          </div>
        </div>
        <div class="relative h-0">
          <div class="slidedown-content w-full z-10">
            {#each menuItems as item}
              <a
                class="bg-base-200 border-t border-slate-600 p-3 w-full block"
                href={localizeHref(`${base}/${item.route}`)}
              >
                {item.text}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row">
      <ul class="menu mx-2 p-0 rounded-sm border border-slate-600 sm:flex hidden max-h-fit top-24 sticky">
        <!-- Desktop side menu -->
        {#key page.route.id}
          {#each menuItems as item}
            <li class="border-t border-slate-600 w-full [top:-1px]">
              <a
                class="rounded-none bg-base-200 p-3"
                class:active={isActive(item.route)}
                href={localizeHref(`${base}/${item.route}`)}
              >
                {item.text}
              </a>
            </li>
          {/each}
        {/key}
      </ul>
      <div class="flex flex-col grow overflow-auto">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>

<style>
  .slidedown {
    position: relative;
  }
  .slidedown:focus ~ .relative > .slidedown-content {
    transform: none;
  }
  .slidedown-content {
    transform-origin: top;
    transform: scaleY(0);
    transition: transform 0.5s;
    position: absolute;
    overflow: hidden;
  }
  .active {
    background-color: var(--color-accent);
    color: var(--color-accent-content);
  }
</style>
