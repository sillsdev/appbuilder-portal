<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { browser } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    type Locale,
    baseLocale,
    locales,
    localizeHref
  } from '$lib/google-play/paraglide/runtime';
  import { getBasicVariant } from '$lib/ldml';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  afterNavigate(() => {
    if (browser) {
      // if page isn't explicitly localized redirect to locale based on preference
      if (!page.url.pathname.match(`^/${data.locale}/`)) {
        const target = (window.navigator.languages as Locale[]).find(
          (l) => locales.includes(l) || locales.includes(getBasicVariant(l) as Locale)
        );

        if (target && target !== data.locale && target !== baseLocale) {
          goto(localizeHref(page.url.href, { locale: target }));
        }
      }
    }
  });
</script>

<div data-theme="light" class="flex flex-col w-full h-full overflow-auto">
  {@render children?.()}
</div>
