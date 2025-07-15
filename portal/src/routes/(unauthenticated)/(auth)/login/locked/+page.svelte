<script lang="ts">
  import { m } from '$lib/paraglide/messages';
</script>

<div class="card shadow-xl bg-base-100 border p-4 flex flex-column items-center">
  <h2>{m.errors_notactiveUser()}</h2>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <p>{@html m.errors_notactiveUserText()}</p>
</div>
