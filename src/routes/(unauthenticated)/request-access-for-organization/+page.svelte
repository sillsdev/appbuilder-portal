<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
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
        toast('error', m.errors_generic({ errorMessage: '' }));
      }
    };
  }}
>
  <div>
    <h1>{m.invitations_requestOrgInvite()}</h1>
    <LabeledFormInput key="invitations_orgName">
      <input class="input w-full validator" type="text" name="organizationName" required />
    </LabeledFormInput>
    <br />
    <LabeledFormInput key="invitations_orgAdminEmail">
      <input class="input w-full validator" type="email" name="email" required />
    </LabeledFormInput>
    <br />
    <LabeledFormInput key="invitations_orgUrl">
      <input class="input w-full validator" type="text" name="url" required />
    </LabeledFormInput>
  </div>
  <div class="mt-4">
    <SubmitButton class="float-right" icon={Icons.Send} />
  </div>
</form>
