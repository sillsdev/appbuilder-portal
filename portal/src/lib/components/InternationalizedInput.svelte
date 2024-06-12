<!--
    @component
    An input slot for a form (stylized)
    
-->
<script lang="ts">
  import { _ } from 'svelte-i18n';
  export let name: string;
</script>

<div>
  <label>
    <div class="label">
      <span class="label-text">
        {$_(name)}
      </span>
    </div>
    <slot />
  </label>
</div>
