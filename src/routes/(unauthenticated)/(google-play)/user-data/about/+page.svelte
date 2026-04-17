<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import {
    DEFAULT_ICON,
    applyThemeToDocument,
    deriveColorFromIcon,
    getThemeVariables
  } from '$lib/utils/theme';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  let themeColor = $state(app.themeColor ?? '#0e795b');

  let themeVars = $derived(getThemeVariables(themeColor));
  let themeStyle = $derived(
    `--color-primary: ${themeVars.primaryHex}; --color-primary-content: ${themeVars.primaryContentHex}; --p: ${themeVars.primaryHSL}; --pf: ${themeVars.primaryHSL}; --pc: ${themeVars.primaryContentHSL}; --udm-shell-light: ${themeVars.shellLightHex}; --udm-shell-dark: ${themeVars.shellDarkHex}; --udm-header-light: ${themeVars.headerLightHex}; --udm-header-dark: ${themeVars.headerDarkHex};`
  );

  $effect(() => {
    applyThemeToDocument(themeColor);
  });

  onMount(() => {
    if (!app.themeColor) {
      deriveColorFromIcon(iconSrc, themeColor).then((hex) => (themeColor = hex));
    }
  });
</script>

<svelte:head>
  <style>
    :global(html),
    :global(body) {
      min-height: 100%;
    }
  </style>
</svelte:head>

<div
  class="udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
  style={themeStyle}
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-8 pb-4 flex items-start gap-4">
      <img
        src={iconSrc}
        alt="App icon"
        class="w-14 h-14 rounded-2xl shadow-sm bg-primary/5 p-0.5"
      />
      <div class="grid justify-items-start text-left gap-0">
        <h2 class="text-lg font-bold tracking-tight leading-none">{app.name}</h2>
        <p class="text-sm text-primary font-bold leading-tight ml-4">{app.developer}</p>
      </div>
    </div>
    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body space-y-3">
          <h2 class="card-title text-lg font-bold">About this app</h2>
          <p class="text-sm leading-relaxed text-base-content/80">{app.shortDesc}</p>

          <details class="group">
            <summary
              class="list-none text-sm font-bold text-primary cursor-pointer hover:underline flex items-center gap-2 select-none"
            >
              Show more
            </summary>
            <div class="pt-3 text-sm whitespace-pre-line leading-relaxed text-base-content/80">
              {app.longDesc}
            </div>
          </details>
        </div>
      </div>

      <a
        class="btn w-full mt-6 border border-primary/20 text-black shadow-sm dark:text-white"
        href={`/user-data?${data.udmQuery}`}
        style="background-color: var(--color-primary);"
      >
        Back to Manage my data
      </a>
    </div>
  </div>
</div>

<style>
  .udm-shell {
    background-color: var(--udm-shell-light);
  }

  .udm-header {
    background-color: var(--udm-header-light);
  }

  :global([data-theme='dark']) .udm-shell {
    background-color: var(--udm-shell-dark);
  }

  :global([data-theme='dark']) .udm-header {
    background-color: var(--udm-header-dark);
  }
</style>
