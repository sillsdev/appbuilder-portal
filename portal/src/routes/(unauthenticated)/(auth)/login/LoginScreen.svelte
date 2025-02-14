<script>
  import ScriptoriaIcon from '$lib/icons/ScriptoriaIcon.svelte';
  import * as m from '$lib/paraglide/messages';
  import { SignIn } from '@auth/sveltekit/components';
</script>

<div class="card shadow-xl bg-white border p-4">
  <div class="w-full flex justify-center">
    <div class="w-10" />
    <ScriptoriaIcon size="128" />
  </div>
  <h1 class="text-center mx-4 py-0 pt-2 text-black">{m.welcome()}</h1>
  <div class="flex flex-col justify-evenly space-y-2">
    <p class="text-black m-4 text-center w-80">
      Scriptoria helps you publish your apps and keep them updated every time the App Builder
      software is improved. You provide the service with your app project data and it will build and
      publish the app to the Google Play store or a website.
    </p>
    <SignIn provider="auth0" signInPage="login" class="signin-button">
      <div slot="submitButton" class="btn btn-primary w-full mx-auto">{m.auth_login()}</div>
    </SignIn>
    <p class="text-gray-700 text-sm text-center">or</p>
    <SignIn
      provider="auth0"
      signInPage="login"
      class="signin-button"
      authorizationParams={{ prompt: 'login', screen_hint: 'signup' }}
    >
      <div slot="submitButton" class="btn w-full mx-auto btn-secondary">
        {m.auth_loginNewSession()}
      </div>
    </SignIn>
  </div>
</div>

<style>
  :global(form.signin-button button) {
    width: 100%;
  }
</style>
