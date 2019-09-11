import { useOrbit, attributesFor, idFromRecordIdentity } from 'react-orbitjs';

import { useRouter } from '~/lib/hooks';

import { TaskResource } from '~/data';

import { relationsFromPath } from '~/data/containers/with-relationship';

import * as env from '@env';

export { withNetwork as withUserTaskList, IProvidedProps as IUserTaskListProps } from './list';

export function useUserTaskHelpers() {
  const { history } = useRouter();
  const { dataStore } = useOrbit();

  const pathToWorkflow = (task: TaskResource) => {
    if (!task) return null;

    const [product, _, workflow] = relationsFromPath(dataStore, task, [
      'product',
      'productDefinition',
      'workflow',
    ]);
    const id = idFromRecordIdentity(dataStore, product);
    const { workflowBusinessFlow } = attributesFor(workflow);

    return `/flow/${workflowBusinessFlow}/${id}`;
  };

  const pathToWorkflowAdmin = (task: TaskResource) => {
    if (!task) return null;

    const [product] = relationsFromPath(dataStore, task, ['product']);
    const id = idFromRecordIdentity(dataStore, product);

    return `${env.DWKIT_ADMIN_URL}/Account/Login/?ReturnUrl=/admin%3Fapanel%3Dworkflowinstances%26aid%3D${id}`;
  };

  return {
    pathToWorkflow,
    pathToWorkflowAdmin,
    navigateToTaskWorkflow(task: TaskResource) {
      const path = pathToWorkflow(task);

      history.push(path);
    },
  };
}
