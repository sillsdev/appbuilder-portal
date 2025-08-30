<script lang="ts">
  import LoginScreen from './LoginScreen.svelte';

  let {
    data
  }: {
    data: {
      serviceAvailable: boolean;
    };
  } = $props();
</script>

<LoginScreen serviceAvailable={data.serviceAvailable} />
