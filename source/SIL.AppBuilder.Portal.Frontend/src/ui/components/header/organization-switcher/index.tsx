import * as React from 'react';
import {
  Dropdown, Icon, Divider
} from 'semantic-ui-react';

import { withRouter, RouteComponentProps  } from 'react-router-dom';

import { setCurrentOrganizationId, getCurrentOrganizationId } from '@lib/current-organization';


export type IProps =
  & { }
  & RouteComponentProps<{}>;

class OrganizationSwitcher extends React.Component<IProps> {
  selectOrganization = (id: string) => (e) => {
    // TODO: clear local data for things bound to an organization id
    setCurrentOrganizationId(id);

    // because localstorage updates don't trigger re-renders.
    this.forceUpdate();
  }

  render() {
    const { history } = this.props;

    const currentOrganizationId = getCurrentOrganizationId();
    const hasSelectedOrg = currentOrganizationId && currentOrganizationId.length > 0;

    return (
      <Dropdown
        data-test-org-switcher
        pointing='top right'
        icon={null}
        trigger={
          <span>
            <Icon circular name='briefcase' size='large' />
          </span>
        }
      >
        <Dropdown.Menu>
          { hasSelectedOrg && (
            <Dropdown.Item
              data-test-org-settings
              text='Current Org Settings'
              onClick={() => history.push(`/organizations/${currentOrganizationId}/settings`)} />
          )}

          <Divider horizontal/>

          <Dropdown.Item text='All Organizations' onClick={this.selectOrganization('')} />

          <Divider horizontal/>

          <Dropdown.Item text='Acme Org' onClick={this.selectOrganization('some-org-id')}/>
          <Dropdown.Item text='SIL' onClick={this.selectOrganization('some-org-id')}/>
          <Dropdown.Item text='DeveloperTown' onClick={this.selectOrganization('some-org-id')}/>
        </Dropdown.Menu>
      </Dropdown>
    );

  }
}

export default withRouter(OrganizationSwitcher);
