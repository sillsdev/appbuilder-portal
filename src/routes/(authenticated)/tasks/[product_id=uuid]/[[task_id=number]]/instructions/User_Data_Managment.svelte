<script lang="ts">
  import type { TaskInstructionProps } from './types';

  let { state }: TaskInstructionProps = $props();
</script>

<h3>Instructions</h3>
<ul>
  <li>
    Browse to the website specified in the <strong>Console URL</strong>
    field.
  </li>
  <li>
    <strong>Find the user identity</strong>
    <ul>
      <li>
        Select <strong>Security</strong>
        &gt;
        <strong>Authentication</strong>
        from the
        <strong>Product categories</strong>
        on the left sidebar.
      </li>
      <li>
        Enter the email address from the <strong>User</strong>
        field in the
        <strong>Search</strong>
        field and find the entry.
      </li>
      <li>
        Hover your mouse over the row and click on the <strong>copy</strong>
        button next to the
        <strong>User UID</strong>
        field that appears.
      </li>
    </ul>
  </li>
  <li>
    <strong>Delete the user data</strong>
    <ul>
      <li>
        To find the user data, select <strong>Databases & Storage</strong>
        &gt;
        <strong>Realtime Database</strong>
        from the
        <strong>Product categories</strong>
        on the left sidebar.
      </li>
      <li>
        Select the <strong>Data</strong>
        tab at the top of the page (it should be selected by default).
      </li>
      <li>
        Expand the <strong>authenticated-users</strong>
        node in the tree view.
      </li>
      <li>
        Find the node with the name that matches the <strong>User UID</strong>
        value you copied earlier. You can use the search field to help find it. Press Ctrl+F (or Cmd+F
        on Mac) to open the search field.
      </li>
      <li>
        Hover your mouse over the node and click on the <strong>Delete</strong>
        button that appears. Click on the
        <strong>Delete</strong>
        button in the confirmation dialog to confirm the deletion.
      </li>
    </ul>
  </li>
  {#if state === 'account'}
    <li>
      <strong>Delete the user identity</strong>
      <ul>
        <li>
          Repeat the process to find the user in the
          <strong>Authentication</strong>
          section described above.
        </li>
        <li>
          Hover your mouse over the row and click on the <strong>Delete</strong>
          button that appears. Click on the
          <strong>Delete</strong>
          button in the confirmation dialog to confirm the deletion.
        </li>
      </ul>
    </li>
  {/if}
</ul>
