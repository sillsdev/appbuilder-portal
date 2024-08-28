import React from 'react';
import { useQuery } from 'react-orbitjs';
import { paths } from '@ui/routes/admin/paths';
import * as toast from '@lib/toast';
import { useDataActions } from '@data/containers/resources/store/use-data-actions';

import Form from './-components/form';

import { buildOptions, buildFindRecord } from '~/data';
import { useTranslations } from '~/lib/i18n';
import { useRouter } from '~/lib/hooks';
import { RectLoader } from '~/ui/components/loaders';

export default function EditForm() {
  const { t } = useTranslations();
  const { update } = useDataActions();
  const { history, match } = useRouter();
  const { id } = match.params || {};

  const {
    result: { store },
    isLoading,
  } = useQuery({
    store: [(q) => buildFindRecord(q, 'store', id), buildOptions({ include: ['store-type'] })],
  });

  if (isLoading) {
    return <RectLoader />;
  }

  const save = async (attributes, relationships) => {
    await update(store, attributes, relationships);

    toast.success(t('models.updateSuccess', { name: t('stores.name') }));

    history.push(paths.settings.stores.path());
  };
  const cancel = () => {
    history.push(paths.settings.stores.path());
  };

  return <Form {...{ store, save, cancel }} />;
}
