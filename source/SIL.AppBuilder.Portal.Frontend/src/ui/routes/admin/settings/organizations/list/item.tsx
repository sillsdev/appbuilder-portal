import * as React from 'react';
import { compose } from 'recompose';
import CreateIcon from '@material-ui/icons/Create';
import StoreIcon from '@material-ui/icons/Shop';
import { withData as withOrbit } from 'react-orbitjs';

import { attributesFor, idFromRecordIdentity, OrganizationResource, UserResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { Link } from 'react-router-dom';

interface IOwnProps {
  organization: OrganizationResource;
  owner: UserResource;
}

type IProps =
  & IOwnProps
  & i18nProps;

class OrganizationItem extends React.Component<IProps> {

  render() {

    const { t, organization, owner } = this.props;

    const {
      name, websiteUrl, buildEngineUrl,
      buildEngineApiAccessToken
    } = attributesFor(organization);

    return (
      <div
        className='flex p-md fs-13 m-b-sm thin-border round-border-4'
      >
        <div className='flex-grow'>
          <div className='bold fs-16'>{name}</div>
          <div className='p-t-md'>
            <span className='bold m-r-sm'>
              {t('admin.settings.organizations.owner')}:
            </span>
            <span>{attributesFor(owner).name}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.organizations.websiteURL')}:
            </span>
            <span>{websiteUrl}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.organizations.buildEngineURL')}:
            </span>
            <span>{buildEngineUrl}</span>
          </div>
          <div>
            <span className='bold m-r-sm'>
              {t('admin.settings.organizations.accessToken')}:
            </span>
            <span>{buildEngineApiAccessToken}</span>
          </div>
        </div>
        <div className='flex-column'>
          <Link
            className='gray-text'
            to={`/admin/settings/organizations/${idFromRecordIdentity(organization)}/edit`}
          >
            <CreateIcon className='fs-16' />
          </Link>
          <Link
            className='gray-text'
            to={`/admin/settings/organizations/${idFromRecordIdentity(organization)}/stores`}
          >
            <StoreIcon className='fs-16' />
          </Link>
        </div>
      </div>
    );
  }

}

export default compose(
  withTranslations,
  withOrbit(({organization}) => ({
    owner: q => q.findRelatedRecord(organization,'owner')
  }))
)(OrganizationItem);