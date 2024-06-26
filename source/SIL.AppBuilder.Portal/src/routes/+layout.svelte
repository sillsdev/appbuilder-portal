<script>
  import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import { i18n } from '$lib/i18n';

  import '../app.css';
</script>

<ParaglideJS {i18n}>
  <div class="h-screen w-full flex flex-col">
    <slot />
  </div>
</ParaglideJS>
