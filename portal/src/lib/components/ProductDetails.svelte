<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { ProductTransitionType } from 'sil.appbuilder.portal.common/prisma';
  import { getTimeDateString } from '$lib/timeUtils';

  export let product: {
    Id: string;
    Store: { Description: string | null } | null;
    Transitions: {
      TransitionType: number;
      InitialState: string | null;
      WorkflowType: number | null;
      AllowedUserNames: string | null;
      Command: string | null;
      Comment: string | null;
      DateTransition: Date | null;
    }[];
  };

  function stateString(workflowTypeNum: number, transitionType: number) {
    const workflowType = (
      m[
        ('admin_settings_workflowDefinitions_workflowTypes_' + workflowTypeNum) as keyof typeof m
      ] as any
    )();
    switch (transitionType) {
      case 2:
        return m.project_products_transitions_transitionTypes_2({
          workflowType
        });
      case 3:
        return m.project_products_transitions_transitionTypes_3({
          workflowType
        });
      case 4:
        return m.project_products_transitions_transitionTypes_4({
          workflowType
        });
    }
    return '';
  }
</script>

<dialog id="modal{product.Id}" class="modal">
  <div class="modal-box w-11/12 max-w-6xl">
    <h2>{m.project_products_transitions_productDetails()}</h2>
    <table class="table">
      <thead>
        <tr>
          <th>{m.project_products_transitions_storeName()}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {product.Store?.Description}
          </td>
        </tr>
      </tbody>
    </table>
    <table class="table">
      <thead>
        <tr>
          <th>{m.project_products_transitions_state()}</th>
          <th>{m.project_products_transitions_user()}</th>
          <th>{m.project_products_transitions_command()}</th>
          <th>{m.project_products_transitions_comment()}</th>
          <th>{m.project_products_transitions_date()}</th>
        </tr>
      </thead>
      <tbody>
        {#each product.Transitions as transition}
          <tr class:font-bold={[2, 3, 4].includes(transition.TransitionType)}>
            <td>
              {#if transition.TransitionType === ProductTransitionType.Activity}
                {transition.InitialState}
              {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
                * {transition.InitialState}
              {:else}
                {stateString(transition.WorkflowType ?? 1, transition.TransitionType)}
              {/if}
            </td>
            <td>
              <!-- Does not include WorkflowUserId mapping. Might be needed but didn't seem like it to me -->
              {#if ![2, 3, 4].includes(transition.TransitionType)}
                {transition.AllowedUserNames || m.appName()}
              {/if}
              <!-- TODO: handle username for Project Access transition types -->
            </td>
            <td>{transition.Command ?? ''}</td>
            <td>
              {#if transition.Comment?.startsWith('system.')}
                {#if transition.Comment.startsWith('system.build-failed')}
                  <span>
                    {m.system_buildFailed()}
                  </span>
                {:else if transition.Comment.startsWith('system.publish-failed')}
                  <span>
                    {m.system_publishFailed()}
                  </span>
                {/if}
                <br />
                <a href={transition.Comment.replace('system.build-failed,', '')}>
                  {m.project_products_publications_console()}
                </a>
              {:else}
                {transition.Comment ?? ''}
              {/if}
            </td>
            <td>
              {getTimeDateString(transition.DateTransition)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{m.project_side_authors_close()}</button>
  </form>
</dialog>

<style>
  /* source: https://github.com/saadeghi/daisyui/issues/3040#issuecomment-2250530354 */
  :root:has(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open])) {
    scrollbar-gutter: unset;
  }
</style>