<script lang="ts">
  import { enhance } from '$app/forms';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { localizeHref } from '$lib/paraglide/runtime';
</script>

<div class="relative mx-auto w-full max-w-6xl p-2">
  <form method="POST" use:enhance>
    <h1 class="pl-2">New Support Data Request</h1>
    <div class="flex flex-col items-center gap-2">
      <div class="row">
        <label class="flex w-full flex-col md:max-w-xs">
          <div class="label">
            <span class="fieldset-label">Request name</span>
          </div>
          <input
            class="input validator w-full"
            name="name"
            type="text"
            required
            maxlength="200"
            placeholder="Short summary of the support request"
          />
          <span class="validator-hint">Enter a name for this request.</span>
        </label>
        <label class="flex w-full flex-col md:max-w-xs">
          <div class="label">
            <span class="fieldset-label">Ticket URL</span>
          </div>
          <input
            class="input validator w-full"
            name="ticketUrl"
            type="url"
            required
            placeholder="https://support.example.com/tickets/123"
          />
          <span class="validator-hint">Enter a valid ticket URL.</span>
        </label>
      </div>
      <div class="row">
        <label class="flex w-full flex-col md:max-w-xs">
          <div class="label">
            <span class="fieldset-label">Description</span>
          </div>
          <textarea
            class="textarea h-48 w-full"
            name="description"
            maxlength="5000"
            placeholder="Add relevant context, symptoms, and troubleshooting details"
          ></textarea>
          <span class="validator-hint">&nbsp;</span>
        </label>
      </div>
      <div class="flex w-full flex-row flex-wrap place-content-center gap-4 p-4">
        <CancelButton returnTo={localizeHref('/support-data')} class="w-full max-w-xs" />
        <SubmitButton class="w-full max-w-xs">Save request</SubmitButton>
      </div>
    </div>
  </form>
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 2);
    column-gap: calc(var(--spacing) * 8);
    width: 100%;
    justify-content: center;
  }
</style>
