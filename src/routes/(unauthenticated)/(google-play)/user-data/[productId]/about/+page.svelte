<script lang="ts">
  import type { PageData } from './$types';
  import { m } from '$lib/google-play/paraglide/messages';
  import { type Locale, getLocale, localizeHref } from '$lib/google-play/paraglide/runtime';
  import { DEFAULT_ICON, getThemeVariables } from '$lib/utils/theme';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const app = data.app;
  const currentLocale = getLocale() as Locale;
  const iconSrc = app.icon ?? DEFAULT_ICON;
  let themeColor = $state(app.themeColor ?? '#0e795b');

  let themeVars = $derived(getThemeVariables(themeColor));
  let themeStyle = $derived(
    `--color-primary: ${themeVars.primaryHex}; --color-primary-content: ${themeVars.primaryContentHex}; --udm-shell-light: ${themeVars.shellLightHex}; --udm-shell-dark: ${themeVars.shellDarkHex}; --udm-header-light: ${themeVars.headerLightHex}; --udm-header-dark: ${themeVars.headerDarkHex};`
  );
</script>

<div
  class="udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
  style={themeStyle}
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-8 pb-4 flex items-start gap-4">
      <img
        src={iconSrc}
        alt={m.app_icon_alt()}
        class="w-14 h-14 rounded-2xl shadow-sm bg-primary/5 p-0.5"
      />
      <div class="min-w-0 grow text-start">
        <h2 class="text-lg font-bold tracking-tight leading-tight break-words">{app.name}</h2>
        <p class="mt-1 text-sm text-primary font-bold leading-tight break-words">{app.developer}</p>
      </div>
    </div>
    <div class="px-5 pb-8">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body space-y-3">
          <h2 class="card-title text-lg font-bold">{m.udm_about_app()}</h2>
          <p class="text-sm leading-relaxed text-base-content/80">{app.shortDesc}</p>

          <details class="group">
            <summary
              class="list-none text-sm font-bold text-primary cursor-pointer hover:underline flex items-center gap-2 select-none"
            >
              {m.udm_show_more()}
            </summary>
            <div class="pt-3 text-sm whitespace-pre-line leading-relaxed text-base-content/80">
              {app.longDesc}
            </div>
          </details>
        </div>
      </div>

      <a
        class="btn btn-primary w-full mt-6"
        href={localizeHref(`/user-data/${app.id}`, { locale: currentLocale })}
      >
        {m.udm_back_to_manage_data()}
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
