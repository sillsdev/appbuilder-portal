<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
</script>

<form
  action="?/request"
  method="post"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === 'success') {
        const data = result.data;
        if (data?.ok) {
          goto('/request-access-for-organization/success');
        }
      } else {
        alert(m.errors_generic({ errorMessage: '' }));
      }
    };
  }}
>
  <div>
    <h1>{m.invitations_requestOrgInvite()}</h1>
    <LabeledFormInput name="invitations_orgName">
      <input
        class="input w-full input-bordered validator"
        type="text"
        name="organizationName"
        required
      />
    </LabeledFormInput>
    <br />
    <LabeledFormInput name="invitations_orgAdminEmail">
      <input class="input w-full input-bordered validator" type="email" name="email" required />
    </LabeledFormInput>
    <br />
    <LabeledFormInput name="invitations_orgUrl">
      <input class="input w-full input-bordered validator" type="text" name="url" required />
    </LabeledFormInput>
  </div>
  <div class="mt-4">
    <input type="submit" class="float-right btn btn-primary" value={m.common_save()} />
  </div>
</form>

<style>
  :global(span.fieldset-label) {
    color: var(--color-black);
  }
  :global(label input) {
    --color-base-100: oklch(100% 0 0);
    --color-base-200: oklch(98.46% 0.0017 247.84);
    --color-base-300: oklch(86.48% 0.0099 252.82);
    --color-base-content: oklch(27.02% 0.0275 257.53);
  }
</style>
