<script>
  import ScriptoriaIcon from '$lib/icons/ScriptoriaIcon.svelte';
  import * as m from '$lib/paraglide/messages';
  import { SignIn } from '@auth/sveltekit/components';
</script>

<div class="card shadow-xl bg-base-100 border p-4">
  <div class="w-full flex justify-center">
    <div class="w-10" />
    <ScriptoriaIcon size="128" />
  </div>
  <h1 class="text-center mx-4 mt-0 pt-2">{m.welcome()}</h1>
  <div class="flex flex-row justify-evenly">
    <SignIn provider="auth0" signInPage="login" class="inline-block">
      <div slot="submitButton" class="btn btn-primary w-full mx-auto">Sign In</div>
    </SignIn>
    <SignIn
      provider="auth0"
      signInPage="login"
      class="inline-block"
      authorizationParams={{ prompt: 'login', screen_hint: 'signup' }}
    >
      <div slot="submitButton" class="btn w-full mx-auto btn-secondary">
        Sign In with new session
      </div>
    </SignIn>
  </div>
</div>
<br />
<a href="https://auth0.com/?utm_source=oss&utm_medium=gp&utm_campaign=oss">
  <img
    src="https://cdn.auth0.com/oss/badges/a0-badge-light.png"
    alt="Auth0 badge"
    class="w-1/2 mx-auto dark:hidden shadow-xl rounded-xl"
  />
  <img
    src="https://cdn.auth0.com/oss/badges/a0-badge-dark.png"
    alt="Auth0 badge"
    class="w-1/2 mx-auto hidden dark:block shadow-xl rounded"
  />
</a>
