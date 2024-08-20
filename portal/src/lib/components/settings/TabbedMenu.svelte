<script lang="ts">
  import { page } from '$app/stores';
  import IconContainer from '../IconContainer.svelte';

  export let menuItems: {
    route: string;
    text: string;
  }[] = [];
  export let base: string;
  export let routeId: string;
  export let title: string = '';
  export let allowTitleWrap = false;

  function isActive(menuRoute: string) {
    return $page.route.id?.replace(routeId, '').startsWith('/' + menuRoute);
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="flex sm:flex-row flex-col">
    <div class="p-4 sm:pr-0 sm:sticky top-0 sm:self-start">
      <slot name="title">
        <h1 class="p-4" class:text-nowrap={!allowTitleWrap}>{title}</h1>
      </slot>
      <div class="rounded border-slate-600 bg-base-200 mx-auto sm:hidden">
        <div class="slidedown p-3" role="button" tabindex="0">
          <div class="flex place-content-between">
            <span>
              {menuItems.find((item) =>
                $page.route.id?.split(routeId + '/')[1].startsWith(item.route)
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
                href="{base}/{item.route}"
              >
                {item.text}
              </a>
            {/each}
          </div>
        </div>
      </div>
      <ul class="menu p-0 rounded border border-slate-600 sm:flex hidden">
        {#key $page.route.id}
          {#each menuItems as item}
            <li class="w-60 border-t border-slate-600 w-full [top:-1px]">
              <a
                class="rounded-none bg-base-200 p-3"
                class:active={isActive(item.route)}
                href="{base}/{item.route}"
              >
                {item.text}
              </a>
            </li>
          {/each}
        {/key}
      </ul>
    </div>
    <div class="flex grow sm:mt-16">
      <div class="flex grow flex-col">
        <slot />
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
</style>
