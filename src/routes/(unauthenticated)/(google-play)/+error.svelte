<script lang="ts">
  import { page } from '$app/state';
  import { m } from '$lib/google-play/paraglide/messages';
</script>

<div class="mx-auto px-2 w-full md:w-1/2 lg:w-1/3">
  <p>
    {#if page.status === 404}
      {m.error_notFound()}
    {:else if page.status === 503}
      {m.error_appUnavailable()}
    {:else}
      {m.error_generic({ errorMessage: page.error?.message ?? '' })}
    {/if}
  </p>
</div>
