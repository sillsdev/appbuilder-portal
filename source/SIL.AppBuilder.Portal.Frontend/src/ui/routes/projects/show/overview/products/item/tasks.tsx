import React from 'react';
import { useOrbit, attributesFor } from 'react-orbitjs';
import { Link } from 'react-router-dom';

import { useTranslations } from '~/lib/i18n';

import { useTimezoneFormatters } from '~/lib/hooks';

import { ProductResource } from '~/data';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { useUserTaskHelpers } from '~/data/containers/resources/user-task';

interface IProps {
  product: ProductResource;
}

export default function ProductTasksForCurrentUser({ product }: IProps) {
  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();
  const { relativeTimeAgo } = useTimezoneFormatters();
  const { navigateToTaskWorkflow, pathToWorkflow } = useUserTaskHelpers();

  const tasks =
    dataStore.cache.query((q) =>
      q
        .findRecords('userTask')
        .filter({ relation: 'product', record: product })
        .filter({ relation: 'user', record: currentUser })
    ) || [];

  if (tasks.length === 0) {
    return <div className='w-100 p-sm p-b-md m-l-md fs-13'>{t('tasks.noTasksTitle')}</div>;
  }

  return (
    <div className='w-100 p-sm p-b-md m-l-md fs-13'>
      {tasks.map((task) => {
        // TODO: activityName will probably need to be translated
        //       need to sync on names of those, or a strategy of how to translate.
        const { activityName, dateCreated, status } = attributesFor(task);
        const waitTime = relativeTimeAgo(dateCreated);

        return (
          <div key={task.id}>
            <span className='red-text'>{t('tasks.waiting', { waitTime })}</span>&nbsp;
            {t('tasks.forYou', { activityName })}
            <Link className='m-l-md bold uppercase' to={pathToWorkflow(task)}>
              {t('common.continue')}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
