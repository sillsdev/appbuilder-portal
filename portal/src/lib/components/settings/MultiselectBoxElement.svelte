<script lang="ts">
  interface Props {
    checked: boolean;
    title: string;
    description: string;
  }

  let { checked = $bindable(), title, description }: Props = $props();
</script>

<div class="my-2">
  <label>
    <span class="flex items-center">
      <input type="checkbox" bind:checked class="checkbox checkbox-accent mr-2 mt-2" />
      <b>
        {title}
      </b>
    </span>
    <p class="ml-8">
      {description}
    </p>
  </label>
</div>
