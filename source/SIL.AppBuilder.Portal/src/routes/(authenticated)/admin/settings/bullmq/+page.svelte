<script lang="ts">
  import { dev } from '$app/environment';
  </script>

<div class="flex flex-col w-full px-4">
  <form action="" method="post">
    <label class="flex place-content-between items-center">
      <!-- TODO: i18n -->
      <span>Choose how long the test task should take</span>
      <div>
        <input type="number" name="seconds" value="10" class="input input-bordered" />
        seconds
      </div>
    </label>
    <div class="flex gap-x-2 my-2">
      <a
        href={dev ? 'http://localhost:3000' : '/admin/jobs'}
        class="btn btn-primary grow"
        target="_blank"
      >
        Open Bull-board panel
      </a>
      <button type="submit" class="grow btn btn-primary">Add Test BullMQ task</button>
    </div>
  </form>
</div>
