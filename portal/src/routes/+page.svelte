<script lang="ts">
  import { SignIn } from '@auth/sveltekit/components';
  import { _ } from 'svelte-i18n';
</script>

<div class="w-full h-full flex flex-rc text-white">
  <div class="relative fg2">
    <div class="bksil">
      <div class="p-4">
        <h1>{$_('welcome')}</h1>
        <p>
          Scriptoria is a service that helps you keep your apps made with the App Builders software
          up-to-date.
        </p>
      </div>
    </div>
  </div>
  <div class="loginside bg-slate-800 py-8">
    <div class="p-4">
      <!-- <form action="/login"> -->
      <h3>{$_('auth.login')}</h3>
      <!-- <input type="hidden" name="providerId" value="auth0" /> -->
      <SignIn className="w-full" provider="auth0" signInPage="login">
        <div slot="submitButton" class="btn btn-primary w-full my-2">
          {$_('auth.login')} / {$_('auth.signup')}
        </div>
      </SignIn>
      <!-- </form> -->
    </div>
  </div>
</div>

<style>
  .flex-rc {
    flex-direction: row;
  }
  .fg2 {
    flex-basis: 70%;
  }
  .bksil::before {
    background-image: url('https://www.sil.org/sites/default/files/history/sil-logo-main-history_0.png');
    background-repeat: no-repeat;
    background-size: 114%;
    background-position: center bottom 50%;
    background-color: hsl(var(--p) / 0.8);
    width: 100%;
    height: 100%;
    content: '';
    /* display: block; */
    position: absolute;
    bottom: 0;
    z-index: -1;
    background-blend-mode: multiply;
    /* flex-grow: 2; */
    /* background-position-y: bottom 100px; */
  }
  .loginside {
    /* background-color: rgb(0, 0, 181); */
    flex-basis: 30%;
  }
  @media (max-aspect-ratio: 113/90) {
    .flex-rc {
      flex-direction: column;
    }
  }
  :global(.signInButton > button) {
    width: 100%;
  }
</style>
