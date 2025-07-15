<script lang="ts">
  import { SignOut } from '@auth/sveltekit/components';
  import { m } from '$lib/paraglide/messages';
</script>

<div class="card bg-white border p-4">
  <h2 class="text-center text-black">{m.header_signOut()} and return to home page</h2>
  <SignOut signOutPage="logout" class="mx-auto">
    {#snippet submitButton()}
      <div class="btn w-full mx-auto">{m.header_signOut()}</div>
    {/snippet}
  </SignOut>
</div>
