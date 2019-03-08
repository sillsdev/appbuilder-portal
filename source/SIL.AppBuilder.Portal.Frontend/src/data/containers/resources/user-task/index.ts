import { useOrbit, attributesFor, idFromRecordIdentity } from 'react-orbitjs';

import { useRouter } from '~/lib/hooks';

import { TaskResource } from '~/data';

import { relationsFromPath } from '~/data/containers/with-relationship';

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

  return {
    pathToWorkflow,
    navigateToTaskWorkflow(task: TaskResource) {
      const path = pathToWorkflow(task);

      history.push(path);
    },
  };
}
