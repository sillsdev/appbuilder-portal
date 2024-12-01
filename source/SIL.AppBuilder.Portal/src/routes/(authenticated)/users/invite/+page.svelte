<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;
  let inputEle: HTMLInputElement;
  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        inputEle.classList.add('btn-success');
        inputEle.value = 'Success!';
        inputEle.classList.remove('btn-primary');
        setTimeout(() => {
          window.location.href = '/users';
        }, 2000);
      }
    }
  });
</script>

<h3>{m.organizationMembership_invite_create_inviteUserModalTitle()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="organizationMembership_invite_create_emailInputPlaceholder">
    <input type="email" name="email" class="input input-bordered w-full" bind:value={$form.email} />
  </LabeledFormInput>
  <!-- Should technically not be this i18n key -->
  <LabeledFormInput name="project_side_organization">
    <select class="select select-bordered" name="organizationId" bind:value={$form.organizationId}>
      {#each data.organizations.filter( (org) => data.session?.user.roles.find((r) => r[0] === RoleId.SuperAdmin || (r[0] === RoleId.OrgAdmin && r[1] === org.Id)) ) as org}
        <option value={org.Id}>{org.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <!-- TODO: org roles and groups -->

  {#if $allErrors.length}
    <ul>
      {#each $allErrors as error}
        <li class="text-red-500">
          <b>{error.path}:</b>
          {error.messages.join('. ')}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" bind:this={inputEle} />
    <a class="btn" href="/users">Cancel</a>
  </div>
</form>
