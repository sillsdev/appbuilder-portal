<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { SignOut } from '@auth/sveltekit/components';
</script>

<div class="card bg-slate-50 border p-4 dark:bg-slate-800">
  <h2 class="text-center">{m.header_signOut()} and return to home page</h2>
  <SignOut signOutPage="logout" class="mx-auto">
    {#snippet submitButton()}
      <div class="btn w-full mx-auto">{m.header_signOut()}</div>
    {/snippet}
  </SignOut>
</div>
