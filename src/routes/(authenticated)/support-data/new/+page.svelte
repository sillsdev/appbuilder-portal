<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<div class="w-full p-4">
  <div class="flex items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold">New Support Data Request</h1>
    <a class="btn btn-ghost" href="/support-data">Back</a>
  </div>

  <form class="mt-6 max-w-xl space-y-4" method="POST" use:enhance>
    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Ticket URL</span>
      </div>
      <input
        class="input input-bordered w-full"
        name="ticketUrl"
        type="url"
        required
        placeholder="https://support.example.com/tickets/123"
      />
    </label>

    <button class="btn btn-primary" type="submit">Save request</button>
  </form>
</div>
