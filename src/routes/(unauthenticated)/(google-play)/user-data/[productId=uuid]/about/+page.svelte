<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import { m } from '$lib/google-play/paraglide/messages';
  import type { Locale } from '$lib/google-play/paraglide/runtime';
  import { localizeHref } from '$lib/google-play/paraglide/runtime';
  import { stripHTML } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div
  class="udm-theme udm-shell min-h-screen w-full place-self-start text-base-content font-sans antialiased break-words"
>
  <div class="w-full bg-base-100 min-h-screen sm:max-w-xl sm:mx-auto">
    <div class="udm-header px-5 pt-8 pb-4 flex items-start gap-4">
      <img
        src={data.app.icon}
        alt={m.app_icon_alt()}
        class="w-14 h-14 rounded-2xl shadow-sm bg-primary/5 p-0.5"
      />
      <div class="min-w-0 grow text-start">
        <h2 class="text-lg font-bold tracking-tight leading-tight break-words ps-0">
          {data.app.name}
        </h2>
        <p class="mt-1 text-sm font-bold leading-tight break-words">{data.app.developer}</p>
      </div>
    </div>
    <div class="px-5 pb-8 pt-2">
      <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
        <div class="card-body space-y-3">
          <h2 class="card-title text-lg font-bold ps-0">{m.about_app()}</h2>
          <p class="text-sm leading-relaxed text-base-content/80">
            {stripHTML(data.app.shortDesc)}
          </p>

          <details class="group">
            <summary
              class="list-none text-sm font-bold cursor-pointer hover:underline flex items-center gap-2 select-none"
            >
              <span class="p-1 rounded-sm">{m.show_more()}</span>
            </summary>
            <div class="pt-3 text-sm whitespace-pre-line leading-relaxed text-base-content/80">
              {stripHTML(data.app.longDesc)}
            </div>
          </details>
        </div>
      </div>

      <a
        class="btn btn-primary w-full mt-6"
        href={localizeHref(`/user-data/${data.app.id}${page.url.search}`, {
          locale: data.locale as Locale
        })}
      >
        {m.back_to_manage_data()}
      </a>
    </div>
  </div>
</div>
