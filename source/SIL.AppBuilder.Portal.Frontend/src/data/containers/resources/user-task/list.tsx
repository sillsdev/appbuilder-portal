import React from 'react';

import { buildOptions, UserTaskResource } from '@data';

import { useQuery, useCache } from 'react-orbitjs';

import { useLiveData } from '~/data/live';

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

export function withNetwork<TWRappedProps>(options: IOptions = {}) {
  const { include } = options;

  return (WrappedComponent) => {
    function Querier(props) {
      const { error, isLoading } = useUserTasksList(include);

      useLiveData('user-tasks');

      const {
        subscriptions: { userTasks },
      } = useCache({
        userTasks: (q) => q.findRecords('userTask'),
      });

      return <WrappedComponent {...{ ...props, error, userTasks }} />;
    }

    return Querier;
  };
}
