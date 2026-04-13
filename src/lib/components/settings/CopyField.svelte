<script lang="ts">
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  interface Props {
    value: string;
  }

  const { value }: Props = $props();

  let copied = $state(false);
</script>

<button
  class="cursor-copy"
  type="button"
  onclick={() => {
    if (value) {
      navigator.clipboard.writeText(value);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 5000);
    }
  }}
>
  {#if copied}
    <IconContainer icon={Icons.Checkmark} width={24} class="text-success" />
  {:else}
    <IconContainer icon={Icons.Copy} width={24} />
  {/if}
</button>
