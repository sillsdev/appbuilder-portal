import { toast } from '@zerodevx/svelte-toast';

export function bytesToHumanSize(bytes: bigint | null) {
  if (bytes === null) {
    return '--';
  }
  const base = BigInt('1024');
  if (bytes > base ** BigInt(3)) {
    return bytes / base ** BigInt(3) + ' GB';
  } else if (bytes > base * base) {
    return bytes / (base * base) + ' MB';
  } else if (bytes > base) {
    return bytes / base + ' KB';
  } else {
    return bytes + ' bytes';
  }
}

function pushToast(type: 'info' | 'success' | 'warning' | 'error', message: string) {
  toast.push(message, { pausable: true, classes: [type] });
}
export { pushToast as toast };

/**
  Locations where toasts are used in S1:
  data/containers/resources/group/with-data-actions.tsx
  data/containers/resources/notification/with-data-actions.tsx
  data/containers/resources/project/with-data-actions.tsx
  data/containers/resources/user/with-user-groups.tsx
  data/containers/resources/user/with-user-roles.tsx
  
  data/containers/with-current-organization/require-selected.tsx
  data/containers/with-role.tsx

  ui/components/product-properties/index.tsx

  ui/routes/admin/invite-organization/index.tsx
  ui/routes/admin/settings/organizations/common/form.tsx
  ui/routes/admin/settings/product-definitions/common/form.tsx
  ui/routes/admin/settings/store-types/common/form.tsx
  ui/routes/admin/settings/stores/-components/form.tsx
  ui/routes/admin/settings/workflow-definitions/common/form.tsx

  ui/routes/invitations/create-organization/form/index.tsx

  ui/routes/organizations/settings/groups/form.tsx
  ui/routes/organizations/settings/groups/list.tsx
  ui/routes/organizations/settings/index.tsx

  ui/routes/projects/edit/display.tsx
  ui/routes/projects/edit/with-access-restriction.tsx
  ui/routes/projects/import/display.tsx
  ui/routes/projects/import/with-access-restriction.tsx
  ui/routes/projects/list/header/bulk-buttons.tsx
  ui/routes/projects/list/header/bulk-product-selection/index.tsx
  ui/routes/projects/new/display.tsx
  ui/routes/projects/new/with-access-restriction.tsx
  ui/routes/projects/show/display.tsx
  ui/routes/projects/show/overview/owners/index.tsx
  ui/routes/projects/show/overview/products/selection-manager/with-product-selection-state.tsx
  ui/routes/projects/show/overview/settings/with-settings.tsx
  ui/routes/projects/show/with-access-restriction.tsx

  ui/routes/users/edit/index.tsx
  ui/routes/users/editsettings/settings/index.tsx
  ui/routes/users/list/add/index.tsx

  ui/routes/workflow/app.tsx
 */