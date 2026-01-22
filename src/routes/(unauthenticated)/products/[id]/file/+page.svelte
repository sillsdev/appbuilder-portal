<script lang="ts">
  // Static mock data; replace with real data in server load later.
  const app = {
    icon: 'https://placehold.co/96x96/png',
    name: 'Sample App Name',
    developer: 'Sample Developer',
    shortDesc: 'A short description from the store listing to reassure users this page is official.',
    longDesc: `A longer description that expands to give more context about the app.
It can include multiple lines of text to mirror the Google Play listing content.

This is static placeholder content for the mockup.`
  };
  const locales = ['en-US', 'fr-FR', 'es-419'];
  let selectedLocale = locales[0];
</script>

<div class="min-h-screen bg-base-200 flex justify-center p-6">
  <div class="w-full max-w-3xl space-y-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body space-y-3">
        <div class="flex items-center gap-4">
          <img src={app.icon} alt="App icon" class="w-16 h-16 rounded-xl object-cover" />
          <div>
            <div class="badge badge-primary mb-1">Official data request</div>
            <h1 class="text-2xl font-bold leading-tight">{app.name}</h1>
            <p class="text-sm text-base-content/70">{app.developer}</p>
          </div>
        </div>

        <p class="text-base">{app.shortDesc}</p>

        <details class="collapse collapse-arrow bg-base-200/60 rounded-box">
          <summary class="collapse-title text-sm font-semibold">Show more</summary>
          <div class="collapse-content whitespace-pre-line text-sm text-base-content/80">
            {app.longDesc}
          </div>
        </details>

        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-sm font-semibold text-base-content/80">Localization:</span>
          <div class="join">
            {#each locales as locale}
              <button
                type="button"
                class={`btn btn-sm join-item ${
                  locale === selectedLocale ? 'btn-primary' : 'btn-ghost'
                }`}
                on:click={() => (selectedLocale = locale)}
              >
                {locale}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-lg">
      <div class="card-body space-y-4">
        <h2 class="text-xl font-semibold">Manage my data</h2>
        <p class="text-sm text-base-content/80">
          Enter your email to request deletion. We will send a 6-digit code to verify it is you.
        </p>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Email</span>
          </label>
          <input
            class="input input-bordered w-full"
            type="email"
            placeholder="you@example.com"
            name="email"
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Use the email associated with your account in the app.
            </span>
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">What do you want to delete?</span>
          </label>
          <div class="space-y-2">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="deletionType" class="radio radio-primary mt-1" checked />
              <span>
                <div class="font-medium">Delete my data</div>
                <div class="text-sm text-base-content/70">
                  Bookmarks, notes, highlights, reading plan progress. Account stays active.
                </div>
              </span>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="deletionType" class="radio radio-primary mt-1" />
              <span>
                <div class="font-medium">Delete my account and data</div>
                <div class="text-sm text-base-content/70">Removes account plus all associated data.</div>
              </span>
            </label>
          </div>
        </div>

        <div class="bg-base-200/70 rounded-box p-3 text-sm">
          <div class="font-semibold mb-1">What will be deleted</div>
          <ul class="list-disc list-inside space-y-1 text-base-content/80">
            <li>Bookmarks</li>
            <li>Notes</li>
            <li>Highlights</li>
            <li>Reading plan progress</li>
          </ul>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Verification</span>
          </label>
          <div class="rounded-box border border-dashed border-base-300 p-4 text-sm text-base-content/70">
            Captcha widget placeholder (Turnstile)
          </div>
        </div>

        <button class="btn btn-primary w-full" type="button">Send verification code</button>
      </div>
    </div>

    <p class="text-xs text-base-content/60">
      This page is provided for {app.name} on Google Play. Need help?
      <a class="link" href="/support">Contact support</a>.
    </p>
  </div>
</div>
