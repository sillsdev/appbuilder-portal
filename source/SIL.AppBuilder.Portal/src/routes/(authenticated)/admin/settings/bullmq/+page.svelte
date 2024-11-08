<script lang="ts">
  import { dev } from '$app/environment';
  import * as m from '$lib/paraglide/messages';
</script>

<div class="flex flex-col w-full px-4">
  <form action="" method="post">
    <label class="flex place-content-between items-center">
      <!-- TODO: i18n -->
      <span>{m.admin_settings_jobAdministration_test_instructions()}</span>
      <div>
        <input type="number" name="seconds" value="10" class="input input-bordered" />
        {m.admin_settings_jobAdministration_test_seconds()}
      </div>
    </label>
    <div class="flex gap-x-2 my-2">
      <a
        href={dev ? 'http://localhost:3000' : '/admin/jobs'}
        class="btn btn-primary grow"
        target="_blank"
      >
       {m.admin_settings_jobAdministration_list()} 
      </a>
      <button type="submit" class="grow btn btn-primary">
        {m.admin_settings_jobAdministration_test_add()}
      </button>
    </div>
  </form>
</div>
