<script>
  import { SignIn } from '@auth/sveltekit/components';
  import { _ } from 'svelte-i18n';
</script>

<div class="card bg-gray-900 p-4">
  <h2 class="text-center">{$_('welcome')}</h2>
  <SignIn provider="auth0" signInPage="login" class="mx-auto">
    <div slot="submitButton" class="btn w-full mx-auto">Sign In with Auth0</div>
  </SignIn>
</div>
<br />
<img
  src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"
  alt="Auth0 badge"
  class="w-1/2 mx-auto"
/>
