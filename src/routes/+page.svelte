<script lang="ts">
  import type { PageData } from './$types';
  import LoginScreen from './(unauthenticated)/(auth)/login/LoginScreen.svelte';

  let {
    data
  }: {
    data: PageData;
  } = $props();
</script>

<div class="grid w-full h-full place-items-center place-content-center [background-color:#0068a6]">
  <LoginScreen serviceAvailable={data.serviceAvailable} />
</div>
