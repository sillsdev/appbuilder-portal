import React from 'react';

import { buildOptions, UserTaskResource } from '@data';

import { useQuery, useCache } from 'react-orbitjs';

import { useLiveData } from '~/data/live';

import { useCurrentUser } from '../../with-current-user';

interface IOptions {
  include?: string[];
}

export interface IProvidedProps {
  userTasks: UserTaskResource[];
  isLoading: boolean;
  error?: any;
}

interface IProps {}

const defaultInclude = ['product.project', 'product.product-definition.workflow'];

export function useUserTasksList(include?: string[]) {
  const requestOptions = buildOptions({
    include: include || defaultInclude,
  });
  const queryTask = useQuery({
    userTasks: [
      (q) => {
        const builder = q.findRecords('userTask');

        return builder;
      },
      requestOptions,
    ],
  });

  return { ...queryTask, userTasks: queryTask.result.userTasks };
}

export function useUserTasksForCurrentUser(
  include?: string[]
): {
  error: Error;
  isLoading: boolean;
  userTasks: UserTaskResource[];
} {
  useLiveData('user-tasks');

  const { error, isLoading } = useUserTasksList(include);
  const { currentUser } = useCurrentUser();

  const {
    subscriptions: { userTasks },
  } = useCache({
    userTasks: (q) =>
      q
        .findRecords('userTask')
        .filter({ relation: 'user', record: currentUser })
        .sort({ attribute: 'dateUpdated', order: 'descending' }),
  });

  return { error, isLoading, userTasks: userTasks || [] };
}

export function withNetwork<TWRappedProps>(options: IOptions = {}) {
  const { include } = options;

  return (WrappedComponent) => {
    function Querier(props) {
      const { error, userTasks } = useUserTasksForCurrentUser(include);

      return <WrappedComponent {...{ ...props, error, userTasks }} />;
    }

    return Querier;
  };
}
