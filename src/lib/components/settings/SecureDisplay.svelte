<script lang="ts" generics="T extends string | null">
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  interface Props {
    value?: T;
  }

  let { value }: Props = $props();

  let visible = $state(false);

  // 20 is default width according to HTML 5 spec
</script>

<span class="inline-flex flex-row gap-x-1">
  <input
    type={visible ? 'text' : 'password'}
    {value}
    readonly
    size={value?.length || 20}
    class="w-full"
  />
  {#if value?.length}
    <button type="button" class="flex flex-row items-center" onclick={() => (visible = !visible)}>
      <IconContainer icon={visible ? Icons.Visible : Icons.Invisible} width={16} />
    </button>
  {/if}
</span>
