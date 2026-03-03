<script lang="ts" generics="T extends string | null">
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  interface Props {
    value?: T;
  }

  let { value }: Props = $props();

  let visible = $state(false);
</script>

<span class="inline-flex flex-row gap-x-1">
  <input type={visible ? 'text' : 'password'} {value} readonly disabled size={value?.length} />
  <button type="button" onclick={() => (visible = !visible)}>
    <IconContainer icon={visible ? Icons.Visible : Icons.Invisible} width={16} />
  </button>
</span>
