
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        toast('success', m.admin_software_update_toast_success());
      }
    }
  });

  // --- Batch state management ---
  // --- Local state for button logic ---
  const started = writable(false);
  const paused = writable(false);
  const parentJobId = writable<string | null>(null);
  const loading = writable(false);
  const error = writable<string | null>(null);

  // --- Actions ---
  async function handleStart(event: Event) {
    event.preventDefault();
    loading.set(true);
    error.set(null);
    try {
      const formEl = event.target as HTMLFormElement;
      const formData = new FormData(formEl);
      const res = await fetch('?/start', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Start failed');
      const result = await res.json();
      parentJobId.set(result.parentJobId);
      started.set(true);
      paused.set(false);
      toast('success', 'Started rebuild batch');
    } catch (e) {
      error.set('Failed to start: ' + (e as Error).message);
    } finally {
      loading.set(false);
    }
  }

  async function handlePause() {
    loading.set(true);
    error.set(null);
    let pid: string | null;
    parentJobId.subscribe((v) => (pid = v))();
    try {
      const formData = new FormData();
      formData.set('parentJobId', pid!);
      const res = await fetch('?/pause', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Pause failed');
      started.set(true);
      toast('success', 'Paused rebuild batch');
    } catch (e) {
      error.set('Failed to pause: ' + (e as Error).message);
      started.set(false);
    } finally {
      loading.set(false);
    }
  }

  async function handleResume() {
    loading.set(true);
    error.set(null);
    let pid: string | null;
    parentJobId.subscribe((v) => (pid = v))();
    try {
      const formData = new FormData();
      formData.set('parentJobId', pid!);
      const res = await fetch('?/resume', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Resume failed');
      paused.set(false);
      toast('success', 'Resumed rebuild batch');
    } catch (e) {
      error.set('Failed to resume: ' + (e as Error).message);
    } finally {
      loading.set(false);
    }
  }
</script>


<div class="w-full">
  <h1>{m.admin_nav_software_update()}</h1>
  <div class="m-4">
    <p class="pl-4">{m.admin_nav_software_update_description()}</p>
    <br />
    <p class="pl-4">
      <b>{m.admin_software_update_affected_organizations()} {data.organizations}</b>
    </p>
    <br />

    {#if $error}
      <div class="alert alert-error">{$error}</div>
    {/if}

    <form class="pl-4" method="post" action="?/start" onsubmit={handleStart}>
      <LabeledFormInput key="admin_nav_software_update_comment">
        <input
          type="text"
          name="comment"
          class="input input-bordered w-full validator"
          bind:value={$form.comment}
          required
        />
        <span class="validator-hint">{m.admin_software_update_comment_required()}</span>
      </LabeledFormInput>
      <div>  
        <input
        type="submit"
        class="btn btn-primary mr-4"
        value={m.admin_software_update_rebuild_start()}
        disabled={$loading || $started}
        />
        <button class="btn btn-warning mr-4" onclick={handlePause} disabled={!$started || $paused || $loading}>
          Pause Rebuilds
        </button>
        <button class="btn btn-success" onclick={handleResume} disabled={!$started || !$paused || $loading}>
          Resume Rebuilds
        </button>
      </div>
    </form>
  </div>
</div>
