<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  interface Props {
    value: string;
  }

  const { value }: Props = $props();

  let copied = $state(false);

  let timeout: ReturnType<typeof setTimeout> | null = $state(null);

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
</script>

<button
  class="cursor-copy"
  type="button"
  onclick={() => {
    if (value) {
      navigator.clipboard.writeText(value).then(
        () => {
          copied = true;
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            copied = false;
          }, 5000);
        },
        (r) => console.log(r)
      );
    }
  }}
>
  {#if copied}
    <IconContainer icon={Icons.Checkmark} width={24} class="text-success" />
  {:else}
    <IconContainer icon={Icons.Copy} width={24} />
  {/if}
</button>
