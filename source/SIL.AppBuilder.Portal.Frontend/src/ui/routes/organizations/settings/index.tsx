import * as React from 'react';
import { match as Match, Redirect } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { compose } from 'recompose';
import { withData, WithDataProps } from 'react-orbitjs';

import * as toast from '@lib/toast';
import NotFound from '@ui/routes/errors/not-found';

// TODO: remove when API data is hooked up
import { withStubbedDevData } from '@data/with-stubbed-dev-data';


import InfoRoute, { pathName as infoPath } from './basic-info';
import UserSetupRoute, { pathName as userPath } from './user-setup';
import ProductsRoute, { pathName as productsPath } from './products';
import GroupsRoute, { pathName as groupsPath } from './groups';
import InfrastructureRoute, { pathName as infrastructurePath } from './infrastructure';
import Navigation from './navigation';

import { OrganizationAttributes, TYPE_NAME } from '@data/models/organization';

export const pathName = '/organizations/:orgId/settings';

export interface Params {
  orgId: string;
}

interface PassedProps {
  match: Match<Params>
}

interface QueriedProps {
  organization: JSONAPI<OrganizationAttributes>;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & WithDataProps;

const mapRecordsToProps = (ownProps: PassedProps) => {
  const { match } = ownProps;
  const { params: { orgId } } = match;

  return {
    organization: q => q.findRecord({ id: orgId, type: TYPE_NAME }),
  }
}

class SettingsRoute extends React.Component<IProps> {
  updateOrganizaion = async (payload: OrganizationAttributes) => {
    try {
      await this.update(payload);

      toast.success(`Updated!`);
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
        ...organization,
        ...payload
      }
    }));
  }

  render() {
    const { organization } = this.props;

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
      <Container>
        <h2 className='page-heading'>Organization Settings</h2>
        <div className='flex-row'>
          <Navigation />

          <div className='m-l-md flex-grow'>
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
      </Container>
    );
  }
}

export default compose(
  // TODO: remove stubbed data after hooking up API
  withStubbedDevData(TYPE_NAME, 'some-org-id', { name: 'Some Org'}),
  withData(mapRecordsToProps)
)(SettingsRoute);
