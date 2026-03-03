<script lang="ts" generics="T">
  import LabeledFormInput, {
    type Props as LabelProps
  } from '$lib/components/settings/LabeledFormInput.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';

  interface Props extends LabelProps {
    value?: T;
  }
  // eslint-disable-next-line svelte/valid-compile
  let { value = $bindable(), ...rest }: Props = $props();

  let visible = $state(false);
</script>

{#snippet after()}
  <button type="button" onclick={() => (visible = !visible)}>
    <IconContainer icon={visible ? Icons.Visible : Icons.Invisible} width={16} />
  </button>
{/snippet}

<LabeledFormInput
  {...rest}
  input={{
    ...rest.input,
    type: visible ? 'text' : 'password',
    icon: rest.input?.icon ?? Icons.Key,
    after
  }}
  bind:value
/>
