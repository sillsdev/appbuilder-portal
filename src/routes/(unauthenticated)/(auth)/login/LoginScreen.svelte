<script lang="ts">
  import { SignIn } from '@auth/sveltekit/components';
  import { browser } from '$app/environment';
  import ScriptoriaIcon from '$lib/icons/ScriptoriaIcon.svelte';
  import * as m from '$lib/paraglide/messages';

  // Add a boolean param
  let {
    serviceAvailable
  }: {
    serviceAvailable: boolean;
  } = $props();
  if (!serviceAvailable && browser) {
    let timeout = setInterval(() => {
      // Reload every 2 seconds to check if the service is back up
      if (serviceAvailable) {
        clearInterval(timeout);
      } else {
        location.reload();
      }
    }, 2000);
  }
</script>

<div class="card shadow-xl bg-white border p-4">
  <div class="w-full flex justify-center">
    <div class="w-10"></div>
    <ScriptoriaIcon size="128" />
  </div>
  <h1 class="text-center mx-4 py-0 pt-2 text-black">{m.welcome()}</h1>
  <div class="flex flex-col justify-evenly space-y-2">
    <p class="text-black m-4 text-center w-80">
      {m.about()}
    </p>
    {#if serviceAvailable}
      <SignIn provider="auth0" signInPage="login" class="signin-button">
        <div slot="submitButton" class="btn btn-primary w-full mx-auto">
          {m.auth_login()}
        </div>
      </SignIn>
      <p class="text-gray-700 text-sm text-center">{m.common_or()}</p>
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
    {:else}
      <p class="text-red-600 text-center">
        {m.errors_appUnavailable()}
      </p>
    {/if}
  </div>
</div>

<div class="my-4 text-center">
  <span>
    {m.invitations_orgPrompt()}
  </span>
  <a class="font-bold" href="/request-access-for-organization">
    {m.contactUs()}
  </a>
</div>

<style>
  :global(form.signin-button button) {
    width: 100%;
  }
</style>
