<script>
  import { SignIn } from '@auth/sveltekit/components';
  import { _ } from 'svelte-i18n';
</script>

<div class="card bg-slate-50 dark:bg-slate-800 border p-4">
  <h2 class="text-center m-4">{$_('welcome')}</h2>
  <SignIn provider="auth0" signInPage="login" class="mx-auto my-4">
    <div slot="submitButton" class="btn btn-primary w-full mx-auto">Sign In</div>
  </SignIn>
  <SignIn
    provider="auth0"
    signInPage="login"
    class="mx-auto"
    authorizationParams={{ prompt: 'login', screen_hint: 'signup' }}
  >
    <div slot="submitButton" class="btn w-full mx-auto">Sign In with new session</div>
  </SignIn>
</div>
<br />
<img
  src="https://cdn.auth0.com/oss/badges/a0-badge-light.png"
  alt="Auth0 badge"
  class="w-1/2 mx-auto dark:hidden"
/>
<img
  src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"
  alt="Auth0 badge"
  class="w-1/2 mx-auto hidden dark:block"
/>
