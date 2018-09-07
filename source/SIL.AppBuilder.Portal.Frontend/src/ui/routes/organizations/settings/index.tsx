import * as React from 'react';
import { match as Match, Redirect } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { compose } from 'recompose';
import { withData, WithDataProps } from 'react-orbitjs';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';

import * as toast from '@lib/toast';
import NotFound from '@ui/routes/errors/not-found';
import { defaultOptions, ORGANIZATIONS_TYPE, query, withLoader, buildFindRecord, buildOptions } from '@data';
import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';


import InfoRoute, { pathName as infoPath } from './basic-info';
import UserSetupRoute, { pathName as userPath } from './user-setup';
import ProductsRoute, { pathName as productsPath } from './products';
import GroupsRoute, { pathName as groupsPath } from './groups';
import InfrastructureRoute, { pathName as infrastructurePath } from './infrastructure';
import Navigation from './navigation';
import { ResourceObject } from 'jsonapi-typescript';
import { withTranslations } from '@lib/i18n';


export const pathName = '/organizations/:orgId/settings';

export interface Params {
  orgId: string;
}

interface PassedProps {
  match: Match<Params>;
}

interface QueriedProps {
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & WithDataProps
  & i18nProps;

const mapRecordsToProps = (ownProps: PassedProps) => {
  const { match } = ownProps;
  const { params: { orgId } } = match;

  return {
    cacheKey: [`org-${orgId}`],
    organization: [q => buildFindRecord(q, TYPE_NAME, orgId), buildOptions()],
  };
};

class SettingsRoute extends React.Component<IProps> {
  updateOrganizaion = async (payload: OrganizationAttributes) => {
    const { t } = this.props;
    try {
      await this.update(payload);

      toast.success(t('updated'));
    } catch (e) {
      toast.error(e.message);
    }
  }

  update = async (payload: OrganizationAttributes) => {
    const { organization, match, updateStore: update } = this.props;
    const { params: { orgId } } = match;

    return await update(t => t.replaceRecord({
      type: TYPE_NAME,
      id: orgId,
      attributes: {
        ...organization.attributes,
        ...payload
      }
    }), defaultOptions());
  }

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
      update: this.updateOrganizaion,
    };

    return (
      <div className='ui container'>
        <h2 className='page-heading page-heading-border-sm'>{t('org.settingsTitle')}</h2>
        <div className='flex-column-xs flex-row-sm align-items-start-sm'>
          <Navigation />

          <div className='m-l-md-sm flex-grow'>
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
  withTranslations
)(SettingsRoute);
