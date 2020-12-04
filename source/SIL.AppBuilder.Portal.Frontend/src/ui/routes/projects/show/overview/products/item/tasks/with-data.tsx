import { useOrbit, useCache } from 'react-orbitjs';

import { ProductResource, TaskResource } from '~/data';

import { useCurrentUser } from '~/data/containers/with-current-user';

interface IProvidedDataProps {
  foundCurrentUser: boolean;
  workTask: TaskResource;
}
interface INeededProps {
  product: ProductResource;
}

export function useCurrentUserTask({ product }: INeededProps): IProvidedDataProps {
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();

  const {
    subscriptions: { tasks },
  } = useCache({
    tasks: (q) => q.findRelatedRecords({ type: 'product', id: product.id }, 'tasks'),
  });

  const foundCurrentUser = tasks.some((task) => {
    const user = dataStore.cache.query((q) => q.findRelatedRecord(task, 'user'));
    return user.id === currentUser.id;
  });

  return { foundCurrentUser, workTask: tasks.slice(-1)[0] };
}
