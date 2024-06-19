<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { SignOut } from '@auth/sveltekit/components';
</script>

<div class="card bg-gray-900 p-4">
  <!-- <h2 class="text-center">{$_('header.signOut')}</h2> -->
  <SignOut signOutPage="logout" class="mx-auto">
    <div slot="submitButton" class="btn w-full mx-auto">{$_('header.signOut')}</div>
  </SignOut>
</div>
