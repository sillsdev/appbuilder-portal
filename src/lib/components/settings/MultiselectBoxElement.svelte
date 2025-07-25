<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    checked: boolean;
    title: string;
    description: string;
    checkProps?: HTMLInputAttributes;
  }

  let { checked = $bindable(), title, description, checkProps }: Props = $props();
</script>

<div class="my-2">
  <label>
    <span class="flex items-center">
      <input
        type="checkbox"
        bind:checked
        class="checkbox checkbox-accent mr-2 mt-2"
        {...checkProps}
      />
      <b>
        {title}
      </b>
    </span>
    <p class="ml-8">
      {description}
    </p>
  </label>
</div>
