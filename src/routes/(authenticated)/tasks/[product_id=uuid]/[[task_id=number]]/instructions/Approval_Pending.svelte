<script lang="ts">
  import type { TaskInstructionProps } from './types';

  // eslint-disable-next-line no-empty-pattern
  let {}: TaskInstructionProps = $props();
</script>

<h3>Instructions</h3>
<p>
  Communicate with the end user if you have questions about whether this project should be
  published.
</p>
<ul>
  <li>
    Select <strong>Reject</strong>
    to terminate this product request.
  </li>
  <li>
    Select <strong>Hold</strong>
    to update the comment on the task.
  </li>
  <li>
    Select <strong>Approve</strong>
    to continue with the product.
  </li>
</ul>
