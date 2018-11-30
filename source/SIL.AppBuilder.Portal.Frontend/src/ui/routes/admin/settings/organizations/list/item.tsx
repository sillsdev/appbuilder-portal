import * as React from 'react';
import { compose } from 'recompose';
import CreateIcon from '@material-ui/icons/Create';

import { attributesFor, idFromRecordIdentity, OrganizationResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { Link } from 'react-router-dom';

interface IOwnProps {
  organization: OrganizationResource;
}

type IProps =
  & IOwnProps
  & i18nProps;

class OrganizationItem extends React.Component<IProps> {

  render() {

    const { t, organization } = this.props;

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
        <div>
          <Link
            className='gray-text'
            to={`/admin/settings/organizations/${idFromRecordIdentity(organization)}/edit`}
          >
            <CreateIcon className='fs-16' />
          </Link>
        </div>
      </div>
    );
  }

}

export default compose(
  withTranslations
)(OrganizationItem);