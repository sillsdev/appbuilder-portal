import * as React from 'react';
import { compose, withProps } from 'recompose';

import { query, buildOptions, withLoader, StoreTypeResource, attributesFor } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compareVia } from '@lib/collection';

import { addStoreTypePathName } from '../index';

import StoreTypeItem from './item';

interface IOwnProps {
  storeTypes: StoreTypeResource[];
}

type IProps = IOwnProps & i18nProps & RouteComponentProps<{}>;

class ListStoreType extends React.Component<IProps> {
  showAddForm = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(addStoreTypePathName);
  };

  render() {
    const { t, storeTypes } = this.props;

    return (
      <>
        <h2 className='sub-page-heading'>{t('admin.settings.storeTypes.title')}</h2>
        <div className='m-b-xxl'>
          <button className='ui button tertiary uppercase large m-b-lg' onClick={this.showAddForm}>
            {t('admin.settings.storeTypes.add')}
          </button>
          {storeTypes.map((storeType, i) => (
            <StoreTypeItem key={i} storeType={storeType} />
          ))}
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  query(() => ({
    storeTypes: [(q) => q.findRecords('storeType'), buildOptions()],
  })),
  withLoader(({ storeTypes }) => !storeTypes),
  withProps(({ storeTypes }) => ({
    storeTypes: storeTypes.sort(compareVia((st) => attributesFor(st).name.toLowerCase())),
  }))
)(ListStoreType);
