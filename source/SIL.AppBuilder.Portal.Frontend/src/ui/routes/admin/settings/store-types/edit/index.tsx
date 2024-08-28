import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  withDataActions,
  IProvidedProps as IStoreTypeProps,
} from '@data/containers/resources/store-type/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';
import { query, withLoader, buildOptions, buildFindRecord, StoreTypeResource } from '@data';

import StoreTypeForm from '../common/form';
import { listPathName } from '../index';

interface IOwnProps {
  productDefinition: StoreTypeResource;
}

type IProps = IStoreTypeProps & IOwnProps & i18nProps & RouteComponentProps<{}>;

class EditStoreType extends React.Component<IProps> {
  update = async (attributes, relationships) => {
    const { updateAttributes, t } = this.props;
    await updateAttributes(attributes, relationships);
    this.redirectToList();
    toast.success(t('admin.settings.storeTypes.editSuccess'));
  };

  redirectToList = () => {
    const { history } = this.props;
    history.push(listPathName);
  };

  render() {
    const { storeType } = this.props;

    const storeTypeProps = {
      storeType,
      onSubmit: this.update,
      onCancel: this.redirectToList,
    };

    return <StoreTypeForm {...storeTypeProps} />;
  }
}

export default compose(
  withRouter,
  withTranslations,
  query(({ match: { params: { storeTypeId } } }) => ({
    storeType: [(q) => buildFindRecord(q, 'storeType', storeTypeId), buildOptions()],
  })),
  withLoader(({ storeType }) => !storeType),
  withDataActions
)(EditStoreType);
