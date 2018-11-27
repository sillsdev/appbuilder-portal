import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { query, buildOptions, withLoader, attributesFor } from '@data';
import { OrganizationResource } from '@data/models/organization';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { formPathName } from './index';

interface IOwnProps {
  organizations: OrganizationResource[];
}

type IProps =
  & i18nProps
  & IOwnProps
  & RouteComponentProps<{}>;

class List extends React.Component<IProps> {

  showAddForm = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(formPathName);
  }

  render() {

    const { t, organizations } = this.props;

    return (
      <>
        <button
          className='ui button tertiary uppercase large m-b-lg'
          onClick={this.showAddForm}
        >
          Add Organization
        </button>
        { organizations.map((org,i) => {

            const {
              name, websiteUrl, buildEngineUrl,
              buildEngineApiAccessToken
            } = attributesFor(org);

            return (
              <div key={i} className='flex flex-column
                              w-100-xs-only flex-100 p-md fs-13
                              m-b-sm thin-border round-border-4'>
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
            );
          })
        }
      </>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  query(() => ({
    organizations: [
      q => q.findRecords('organization'), buildOptions()
    ],
  })),
  withLoader(({organizations}) => !organizations)
)(List);