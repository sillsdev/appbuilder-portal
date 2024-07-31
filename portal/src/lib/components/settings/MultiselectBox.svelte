<script lang="ts">
  export let header: string;
</script>

<div class="border border-opacity-15 border-gray-50 rounded-lg p-2">
  <div>
    <span>{header}</span>
  </div>
  <slot />
</div>
