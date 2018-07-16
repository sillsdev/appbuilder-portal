import * as React from 'react';
import { match as Match } from 'react-router';
import { Form, Button } from 'semantic-ui-react';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { OrganizationAttributes } from '@data/models/organization';

import SelectLogo from '../select-logo';

export const pathName = '/organizations/:orgId/settings';

export interface IState {
  name: string;
  logo: string;
}

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: JSONAPI<OrganizationAttributes>;
}

@withTemplateHelpers
class BasicInfoRoute extends React.Component<IProps, IState> {
  mut: Mut;
  state = { name: '', logo: '' };

  componentDidMount() {
    const { organization } = this.props;
    const { attributes: { name, logo } } = organization;

    this.setState({ name, logo });
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { update } = this.props;

    update(this.state);
  }

  render() {
    const {
      mut,
      state: { name, logo },
    } = this;

    return (
      <Form className='sub-page-content' onChange={this.onSubmit}>
        <div className='flex-column-reverse-xs flex-row-sm justify-content-space-between m-b-md'>

          <div className='flex-grow'>
            <h2 className='d-xs-none bold m-b-xl'>Basic Info</h2>
            <Form.Field className='m-b-md'>
              <label>Organization Name</label>
              <input
                value={name}
                onChange={mut('name')}
                placeholder='Organization Name'
              />
            </Form.Field>
          </div>

          <div className='m-l-md-sm m-b-md'>
            <SelectLogo value={logo} onChange={mut('logo')}/>
          </div>
        </div>

        <Button
          className='
            m-t-md-xs-only w-100-xs-only
            p-md-xs-only m-b-md-xs-only
          '
          type='submit' onClick={this.onSubmit}>
          Save
        </Button>
      </Form>
    );
  }
}

export default BasicInfoRoute;
