<!--
    @component
    An input slot for a form (stylized)
    
-->
<script lang="ts">
  import type { ValidI13nKey } from "$lib/i18n";
  import * as m from "$lib/paraglide/messages";
  export let name: ValidI13nKey;
</script>

<div>
  <label>
    <div class="label">
      <span class="label-text">
        {m[name]()}
      </span>
    </div>
    <slot />
  </label>
</div>
