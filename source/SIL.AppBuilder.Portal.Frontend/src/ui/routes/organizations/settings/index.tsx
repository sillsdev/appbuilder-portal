import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { match as Match } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { withData, WithDataProps } from 'react-orbitjs';

import NotFound from '@ui/routes/errors/not-found';
import { defaultOptions, query, withLoader, buildFindRecord, buildOptions } from '@data';
import { OrganizationAttributes, TYPE_NAME, OrganizationResource } from '@data/models/organization';


import InfoRoute, { pathName as infoPath } from './basic-info';
import UserSetupRoute, { pathName as userPath } from './user-setup';
import ProductsRoute, { pathName as productsPath } from './products';
import GroupsRoute, { pathName as groupsPath } from './groups';
import InfrastructureRoute, { pathName as infrastructurePath } from './infrastructure';
import Navigation from './navigation';

import { withTranslations, i18nProps } from '@lib/i18n';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps
} from '@data/containers/resources/organization/with-data-actions';


export const pathName = '/organizations/:orgId/settings';

export interface Params {
  orgId: string;
}

interface PassedProps {
  match: Match<Params>;
}

interface QueriedProps {
  organization: OrganizationResource;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & WithDataProps
  & i18nProps
  & IDataActionsProps;

const mapRecordsToProps = (ownProps: PassedProps) => {
  const { match } = ownProps;
  const { params: { orgId } } = match;

  return {
    cacheKey: [`org-${orgId}`],
    organization: [q => buildFindRecord(q, TYPE_NAME, orgId), buildOptions({
      include: ['organization-product-definitions']
    })],
  };
};

class SettingsRoute extends React.Component<IProps> {

  updateOrganization = async (payload: OrganizationAttributes) => {

    const { t, updateAttributes } = this.props;

    try {

      await updateAttributes(payload);
      toast.success(t('updated'));

    } catch (e) {
      toast.error(e.message);
    }
  }

  // update = async (payload: OrganizationAttributes, relationships?) => {
  //   const { organization, match, updateStore: update } = this.props;
  //   const { params: { orgId } } = match;

  //   return await update(t => t.replaceRecord({
  //     type: TYPE_NAME,
  //     id: orgId,
  //     attributes: {
  //       ...organization.attributes,
  //       ...payload
  //     }
  //   }), defaultOptions());
  // }

  render() {
    const { organization, t } = this.props;

    if (!organization) {
      return (
        <div className='m-t-xl'>
          <NotFound />
        </div>
      );
    }

    const settingsProps = {
      organization,
      update: this.updateOrganization,
    };

    return (
      <div className='ui container'>
        <h2 className='page-heading page-heading-border-sm'>{t('org.settingsTitle')}</h2>
        <div className='flex-column-xs flex-row-sm align-items-start-sm'>
          <Navigation />

          <div className='m-l-lg flex-grow'>
            <Switch>
              <Route exact path={infoPath} render={(routeProps) => (
                <InfoRoute {...routeProps } {...settingsProps } />
              )} />

              <Route path={userPath} render={(routeProps) => (
                <UserSetupRoute {...routeProps } organization={organization} />
              )} />

              <Route path={productsPath} render={(routeProps) => (
                <ProductsRoute {...routeProps } {...settingsProps} />
              )} />

              <Route path={groupsPath} render={(routeProps) => (
                <GroupsRoute {...routeProps } organization={organization} />
              )} />

              <Route path={infrastructurePath} render={(routeProps) => (
                <InfrastructureRoute {...routeProps } {...settingsProps} />
              )} />

            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  query(mapRecordsToProps),
  withLoader(({ organization }) => !organization),
  withTranslations,
  withDataActions
)(SettingsRoute);
