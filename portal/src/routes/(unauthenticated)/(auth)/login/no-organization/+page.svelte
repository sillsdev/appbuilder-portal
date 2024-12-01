<script lang="ts">
  import * as m from '$lib/paraglide/messages';
</script>

<div class="card shadow-xl bg-base-100 border p-4 flex flex-column items-center">
  <h2>{m.errors_orgMembershipRequired()}</h2>
  <p>{@html m.errors_orgMembershipRequiredText()}</p>
</div>
