import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  withDataActions,
  IProvidedProps as IStoreTypeProps,
} from '@data/containers/resources/store-type/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';

import StoreTypeForm from '../common/form';
import { listPathName } from '../index';

type IProps = i18nProps & IStoreTypeProps & RouteComponentProps<{}>;

class NewStoreType extends React.Component<IProps> {
  save = async (attributes, relationships) => {
    const { createRecord, t } = this.props;
    await createRecord(attributes, relationships);
    toast.success(t('admin.settings.storeType.addSuccess'));
    this.redirectToList();
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const storeTypeProps = {
      onSubmit: this.save,
      onCancel: this.redirectToList,
    };

    return <StoreTypeForm {...storeTypeProps} />;
  }
}

export default compose(withTranslations, withRouter, withDataActions)(NewStoreType);
