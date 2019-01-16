import * as React from 'react';
import { compose, withProps } from 'recompose';

import { query, buildOptions, withLoader, OrganizationResource, attributesFor } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compareVia } from '@lib/collection';

import { addOrganizationPathName } from '../index';

import OrganizationItem from './item';

interface IOwnProps {
  organizations: OrganizationResource[];
}

type IProps = IOwnProps & i18nProps & RouteComponentProps<{}>;

class ListOrganization extends React.Component<IProps> {
  showAddForm = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(addOrganizationPathName);
  };

  render() {
    const { t, organizations } = this.props;

    return (
      <>
        <h2 className='sub-page-heading'>{t('admin.settings.organizations.title')}</h2>
        <div className='m-b-xxl'>
          <button className='ui button tertiary uppercase large m-b-lg' onClick={this.showAddForm}>
            {t('admin.settings.organizations.add')}
          </button>
          {organizations.map((organization, i) => (
            <OrganizationItem key={i} organization={organization} />
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
    organizations: [
      (q) => q.findRecords('organization'),
      buildOptions({
        include: ['owner'],
      }),
    ],
  })),
  withLoader(({ organizations }) => !organizations),
  withProps(({ organizations }) => ({
    organizations: organizations.sort(compareVia((org) => attributesFor(org).name.toLowerCase())),
  }))
)(ListOrganization);
