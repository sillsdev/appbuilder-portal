import * as React from 'react';
import { compose } from 'recompose';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import { withData as withOrbit } from 'react-orbitjs';

import { attributesFor, StoreTypeResource, idFromRecordIdentity } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  storeType: StoreTypeResource;
}

type IProps = IOwnProps & i18nProps;

class ProductDefinitionItem extends React.Component<IProps> {
  render() {
    const { t, storeType } = this.props;

    const { name, description } = attributesFor(storeType);

    return (
      <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
        <div className='flex-grow'>
          <div className='bold fs-16'>{name}</div>
          <div className='p-t-md'>
            <span className='bold m-r-sm'>{t('admin.settings.storeTypes.description')}:</span>
            <span>{description}</span>
          </div>
        </div>
        <div>
          <Link
            className='gray-text'
            to={`/admin/settings/store-types/${idFromRecordIdentity(storeType)}/edit`}
          >
            <CreateIcon className='fs-16' />
          </Link>
        </div>
      </div>
    );
  }
}

export default compose<IProps, IOwnProps>(withTranslations)(ProductDefinitionItem);
