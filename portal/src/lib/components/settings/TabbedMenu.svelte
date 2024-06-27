<script lang="ts">
  import { page } from '$app/stores';

  export let menuItems: {
    route: string;
    text: string;
  }[] = [];
  export let base: string;
  export let routeId: string;
  export let title: string;

  function isActive(menuRoute: string) {
    return $page.route.id?.replace(routeId, '').startsWith('/' + menuRoute);
  }
</script>

<div class="w-full max-w-6xl mx-auto">
  <div class="flex flex-row">
    <div class="p-4 sticky top-0 self-start">
      <!-- No idea why tailwind text-nowrap won't work, but this does -->
      <h1 class="p-4 [text-wrap:nowrap]">{title}</h1>
      <ul class="menu p-0 rounded border border-slate-600">
        {#key $page.route.id}
          {#each menuItems as item}
            <li class="w-60 border-t border-slate-600 w-full [top:-1px]">
              <a
                class="rounded-none bg-base-200 p-3"
                class:active={isActive(item.route)}
                href="{base}/{item.route}">{item.text}</a
              >
            </li>
          {/each}
        {/key}
      </ul>
    </div>
    <div class="flex grow mt-16">
      <div class="flex grow flex-col">
        <slot />
      </div>
    </div>
  </div>
</div>
