<script lang="ts">
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
</script>

<div class="mx-auto px-2 w-full md:w-1/2 lg:w-1/3">
  {#if page.status === 403}
    <p class="pt-20">{m.errors_friendlyForbidden()}</p>
  {:else if page.status === 404}
    <h1 class="pl-0">{m.errors_notFoundTitle()}</h1>
    <p>{m.errors_notFoundDescription()}</p>
  {:else if page.status === 503}
    <p class="pt-20">{m.errors_appUnavailable()}</p>
  {:else}
    <h1>{page.status}: {page.error?.message}</h1>
  {/if}
  <hr class="my-2" />
  {#if page.status !== 503}
    <a class="btn btn-primary" href={localizeHref('/tasks')}>{m.home()}</a>
  {:else}
    <a class="btn btn-primary" href={localizeHref('/login')}>{m.auth_login()}</a>
  {/if}
</div>
