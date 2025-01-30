<script lang="ts">
  export let checked: boolean;
  export let title: string;
  export let description: string;
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
